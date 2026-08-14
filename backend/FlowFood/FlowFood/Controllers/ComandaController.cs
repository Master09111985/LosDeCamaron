using FlowFood.Models;
using FlowFood.Models.Dtos;
using FlowFood.Repositorio.IRepositorio;
using Microsoft.AspNetCore.Mvc;

namespace FlowFood.Controllers
{
  [Route("flowfood/comanda")]
  [ApiController]
  public class ComandaController : ControllerBase
  {
    private readonly IComandaRepositorio _coRepo;

    public ComandaController(IComandaRepositorio coRepo)
    {
      _coRepo = coRepo;
    }

    [HttpPost("Guardar")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CrearComanda([FromBody] CrearComandaDto crearDto)
    {
      if (crearDto == null || !ModelState.IsValid)
        return BadRequest(ModelState);

      if (crearDto.Detalles == null || crearDto.Detalles.Count == 0)
      {
        ModelState.AddModelError("", "La comanda debe contener al menos un platillo.");
        return StatusCode(400, ModelState);
      }

      // 1. Validaciones Condicionales según la lógica (1 a 5)
      switch (crearDto.TipoPedido)
      {
        case 1: // Local
          if (string.IsNullOrEmpty(crearDto.NumeroMesa)) return BadRequest("Falta el número de mesa.");
          break;
        case 2: // Llevar
          if (string.IsNullOrEmpty(crearDto.NombreClienteLlevar)) return BadRequest("Falta el nombre del cliente.");
          break;
        case 3: // Domicilio
          if (crearDto.ClienteId == null || crearDto.ClienteId <= 0) return BadRequest("Seleccione un cliente para el domicilio.");
          break;
        case 4: // Agendado
          if (crearDto.ClienteId == null || crearDto.ClienteId <= 0) return BadRequest("Seleccione un cliente para la entrega.");
          if (crearDto.FechaHoraAgendada == null) return BadRequest("Falta la fecha y hora agendada.");
          break;
        case 5: // Plataforma
          if (crearDto.PlataformaId == null || crearDto.PlataformaId <= 0) return BadRequest("Seleccione la plataforma de origen.");
          break;
      }

      // 2. Calcular los totales de forma segura del lado del servidor
      decimal totalCalculado = 0;
      var detallesList = new List<ComandaDetalle>();

      foreach (var item in crearDto.Detalles)
      {
        var subtotalItem = item.Cantidad * item.PrecioUnitario;
        totalCalculado += subtotalItem;

        detallesList.Add(new ComandaDetalle
        {
          PlatilloId = item.PlatilloId,
          Cantidad = item.Cantidad,
          PrecioUnitario = item.PrecioUnitario,
          Subtotal = subtotalItem,
          Notas = item.Notas
        });
      }

      // 3. Estatus inicial: 0 si es Agendado, 1 (Cocinando) para los demás
      int estatusInicial = (crearDto.TipoPedido == 4) ? 0 : 1;

      var nuevaComanda = new Comanda
      {
        TipoPedido = crearDto.TipoPedido,
        NumeroMesa = crearDto.NumeroMesa,
        NombreClienteLlevar = crearDto.NombreClienteLlevar,
        ClienteId = crearDto.ClienteId,
        FechaHoraAgendada = crearDto.FechaHoraAgendada,
        PlataformaId = crearDto.PlataformaId,
        MetodoPagoId = crearDto.MetodoPagoId,
        Estatus = estatusInicial,
        Subtotal = totalCalculado,
        Total = totalCalculado, // Aquí después podriamos sumar envío si aplica
        FechaRegistro = DateTime.UtcNow
      };

      if (!await _coRepo.CrearComandaAsync(nuevaComanda))
      {
        return StatusCode(500, "Ocurrió un error al guardar la comanda.");
      }

      return Ok(new
      {
        mensaje = "Comanda creada exitosamente",
        comandaId = nuevaComanda.Id,
        estatus = estatusInicial
      });
    }

    // Endpoint extra que nos servirá después para el KDS (Kitchen Display System)
    [HttpPatch("CambiarEstatus/{id}")]
    public async Task<IActionResult> CambiarEstatus(int id, [FromBody] int nuevoEstatus)
    {
      // Validamos que sea un estatus entre 0 y 3
      if (nuevoEstatus < 0 || nuevoEstatus > 3)
        return BadRequest("El estatus debe estar entre 0 y 3.");

      if (!await _coRepo.ActualizarEstatusComandaAsync(id, nuevoEstatus))
        return StatusCode(500, "Error al actualizar el estatus.");

      return Ok(new { mensaje = "Estatus actualizado correctamente." });
    }
  }
}
