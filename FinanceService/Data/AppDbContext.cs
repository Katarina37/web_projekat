using Microsoft.EntityFrameworkCore;
using FinanceService.Models;

namespace FinanceService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Expense> Expenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.ToTable(t => t.HasCheckConstraint("CHK_Amount", "Amount >= 0"));
                entity.ToTable(t => t.HasCheckConstraint("CHK_Category",
                    "Category IN ('transport', 'accommodation', 'food', 'tickets', 'shopping', 'other')"));
            });
        }
    }
}
