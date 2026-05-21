using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext context;
        private readonly IMapper mapper;
        private readonly IConfiguration configuration;

        public AuthService(AppDbContext context, IMapper mapper, IConfiguration configuration)
        {
            this.context = context;
            this.mapper = mapper;
            this.configuration = configuration;
        }

        public async Task<UserDTO?> Register(RegisterDTO dto)
        {
            if (await context.Users.AnyAsync(u => u.Email == dto.Email))
                return null;

            var user = mapper.Map<User>(dto);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            user.Role = "User";
            user.CreatedAt = DateTime.UtcNow;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return mapper.Map<UserDTO>(user);
        }

        public async Task<string?> Login(LoginDTO dto)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if(user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            return GenerateToken(user);
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            var users = await context.Users.ToListAsync();
            return mapper.Map<IEnumerable<UserDTO>>(users);
        }

        public async Task<UserDTO?> GetUserById(int id)
        {
            var user = await context.Users.FindAsync(id);
            return user == null ? null : mapper.Map<UserDTO>(user);
        }

        public async Task<bool> DeleteUser(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
                return false;
            
            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return true;
        }

        private string GenerateToken(User user)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
