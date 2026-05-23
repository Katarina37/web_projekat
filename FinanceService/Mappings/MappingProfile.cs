using AutoMapper;
using FinanceService.DTOs;
using FinanceService.Models;

namespace FinanceService.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile() 
        {
            CreateMap<Expense, ExpenseDto>();
            CreateMap<CreateExpenseDto, Expense>();
        }
    }
}
