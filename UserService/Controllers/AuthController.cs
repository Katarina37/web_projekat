using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.DTOs;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService _authService)
        {
            authService = _authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            if (string.IsNullOrEmpty(dto.FirstName) || string.IsNullOrEmpty(dto.LastName) ||
                string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest(new {message = "Sva polja su obavezna"});

            var result = await authService.Register(dto);
            if (result == null)
                return Conflict(new {message = "Korisnik sa tim email-om vec postoji"});

            return CreatedAtAction(nameof(GetUserById), new {id = result.Id}, result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var token = await authService.Login(dto);
            if (token == null)
                return Unauthorized(new {message = "Pogresan email ili lozinka." });

            return Ok(new {token});
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await authService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await authService.GetUserById(id);
            if (user == null)
                return NotFound(new {message = "Korisnik nije pronadjen."});

            return Ok(user);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await authService.DeleteUser(id);
            if (!result)
                return NotFound(new {message = "Korisnik nije pronadjen."});

            return NoContent();
        }

    }
}
