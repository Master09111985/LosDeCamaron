using FlowFood.Models;

namespace FlowFood.Repositorio.IRepositorio
{
  public interface IComandaRepositorio
  {
    Task<ICollection<Comanda>> GetComandasAsync();
    Task<Comanda> GetComandaAsync(int id);
    Task<bool> CrearComandaAsync(Comanda comanda);
    Task<bool> ActualizarEstatusComandaAsync(int id, int nuevoEstatus);
    Task<bool> GuardarAsync();
  }
}
