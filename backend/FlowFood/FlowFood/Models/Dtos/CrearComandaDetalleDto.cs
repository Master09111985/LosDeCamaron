using System.ComponentModel.DataAnnotations;

namespace FlowFood.Models.Dtos
{
  public class CrearComandaDetalleDto
  {
    [Required]
    public int PlatilloId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [Required]
    public decimal PrecioUnitario { get; set; }

    public string? Notas { get; set; } // "Sin cebolla", etc.
  }
}
