using UserService.DTOs;

namespace UserService.Services
{
    public interface IAuthService
    {
        Task<UserDTO?> Register(RegisterDTO dto);
        Task<string?> Login(LoginDTO dto);
        Task<IEnumerable<UserDTO>> GetAllUsers();
        Task<UserDTO?> GetUserById(int id);
        Task<bool> DeleteUser(int id);
    }
}
