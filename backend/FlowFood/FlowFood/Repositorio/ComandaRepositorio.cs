using FlowFood.Data;
using FlowFood.Models;
using FlowFood.Repositorio.IRepositorio;
using Microsoft.EntityFrameworkCore;

namespace FlowFood.Repositorio
{
  public class ComandaRepositorio : IComandaRepositorio
  {
    private readonly DataContext _context;

    public ComandaRepositorio(DataContext context)
    {
      _context = context;
    }

    public async Task<ICollection<Comanda>> GetComandasAsync()
    {
      // Traemos las comandas ordenadas por la más reciente
      return await _context.Comandas
          .Include(c => c.Detalles)
              .ThenInclude(d => d.Platillo)
          .OrderByDescending(c => c.FechaRegistro)
          .ToListAsync();
    }

    public async Task<Comanda> GetComandaAsync(int id)
    {
      return await _context.Comandas
          .Include(c => c.Detalles)
              .ThenInclude(d => d.Platillo)
          .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<bool> CrearComandaAsync(Comanda comanda)
    {
      _context.Comandas.Add(comanda);
      return await GuardarAsync();
    }

    public async Task<bool> ActualizarEstatusComandaAsync(int id, int nuevoEstatus)
    {
      var comanda = await _context.Comandas.FindAsync(id);
      if (comanda != null)
      {
        comanda.Estatus = nuevoEstatus;
        return await GuardarAsync();
      }
      return false;
    }

    public async Task<bool> GuardarAsync()
    {
      return await _context.SaveChangesAsync() >= 0;
    }
  }
}
