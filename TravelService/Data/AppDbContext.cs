using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TravelPlan> TravelPlans { get; set; }
        public DbSet<Destination> Destinations { get; set; }   
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<SharedPlan> SharedPlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TravelPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Budget).HasColumnType("decimal(18,2)");
                entity.ToTable(t => t.HasCheckConstraint("CHK_Dates", "EndDate >= StartDate"));
                entity.ToTable(t => t.HasCheckConstraint("CHK_Budget", "Budget >= 0"));
            });

            modelBuilder.Entity<Destination>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.HasOne(e => e.TravelPlan)
                .WithMany(e => e.Destinations)
                .HasForeignKey(e => e.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Activity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.EstimatedCost).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("planned");
                entity.HasOne(e => e.TravelPlan)
                      .WithMany(e => e.Activities)
                      .HasForeignKey(e => e.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChecklistItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.HasOne(e => e.TravelPlan)
                      .WithMany(e => e.ChecklistItems)
                      .HasForeignKey(e => e.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SharedPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.AccessType).HasMaxLength(10).HasDefaultValue("view");
                entity.HasOne(e => e.TravelPlan)
                      .WithMany(e => e.SharedPlans)
                      .HasForeignKey(e => e.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
