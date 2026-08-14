using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowFood.Models
{
  public class Comanda
  {
    [Key]
    public int Id { get; set; }

    // 1: Local, 2: Llevar, 3: Domicilio, 4: Agendado, 5: Plataforma
    [Required]
    public int TipoPedido { get; set; }

    // --- Campos condicionales segun el tipo de pedido
    [MaxLength(20)]
    public string? NumeroMesa { get; set; } // Para tipo 1

    [MaxLength(100)]
    public string? NombreClienteLlevar { get; set; } // Para tipo 2

    public int? ClienteId { get; set; } // Para tipos 3 y 4 (Ctalogo de clientes)

    public DateTime? FechaHoraAgendada { get; set; } // Para tipo 4

    public int? PlataformaId { get; set; } // Para tipo 5

    // --- Datos financieros y estatus
    [Required]
    public int MetodoPagoId { get; set; }

    // 0: Agendado, 1: Cocinando, 2: Entregado, 3: Pagado
    [Required]
    public int Estatus { get; set; }

    [Required]
    public decimal Subtotal { get; set; }

    [Required]
    public decimal Total { get; set; }

    [Required]
    public DateTime FechaRegistro { get; set; }

    // Relacion con Cliente
    public int? clienteId { get; set; }
    [ForeignKey("clienteId")]
    public Cliente Cliente { get; set; }

    // Relacion con Plataforma
    public int? plataformaId { get; set; }
    [ForeignKey("plataformaId")]
    public Plataforma Plataforma { get; set; }

    // Relacion con MetodoPago
    public int metodoPagoId { get; set; }
    [ForeignKey("metodoPagoId")]
    public MetodoPago MetodoPago { get; set; }
  }
}
