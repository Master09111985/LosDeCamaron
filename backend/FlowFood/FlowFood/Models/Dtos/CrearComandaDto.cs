using System.ComponentModel.DataAnnotations;

namespace FlowFood.Models.Dtos
{
  public class CrearComandaDto
  {
    [Required]
    [Range(1, 5, ErrorMessage = "El tipo de pedido debe ser entre 1 y 5")]
    public int TipoPedido { get; set; }

    public string? NumeroMesa { get; set; }
    public string? NombreClienteLlevar { get; set; }
    public int? ClienteId { get; set; }
    public DateTime? FechaHoraAgendada { get; set; }

    public int? PlataformaId { get; set; }

    [Required(ErrorMessage = "Debe seleccionar un método de pago")]
    public int MetodoPagoId { get; set; }

    [Required]
    public List<CrearComandaDetalleDto> Detalles { get; set; }
  }
}
