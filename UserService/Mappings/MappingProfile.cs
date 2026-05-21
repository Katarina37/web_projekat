using AutoMapper;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDTO>();
            CreateMap<RegisterDTO, User>();
        }
    }
}
