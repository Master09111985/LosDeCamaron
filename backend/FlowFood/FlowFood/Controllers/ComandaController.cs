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

    // ==========================================
    // GET: Listar Todas
    // ==========================================
    [HttpGet("listar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetComandas()
    {
      var listaComandas = await _coRepo.GetComandasAsync();
      var listaDto = listaComandas.Select(MapearComandaDto).ToList();
      return Ok(listaDto);
    }

    // ==========================================
    // GET: Buscar por ID
    // ==========================================
    [HttpGet("buscar/{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetComanda(int id)
    {
      if (!await _coRepo.ExisteComandaAsync(id))
        return NotFound();

      var comanda = await _coRepo.GetComandaAsync(id);
      return Ok(MapearComandaDto(comanda));
    }

    // ==========================================
    // POST: Crear Comanda
    // ==========================================
    [HttpPost("crearcomanda")]
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

      // 1. Validaciones Condicionales
      switch (crearDto.TipoPedido)
      {
        case 1: if (string.IsNullOrEmpty(crearDto.NumeroMesa)) return BadRequest("Falta el número de mesa."); break;
        case 2: if (string.IsNullOrEmpty(crearDto.NombreClienteLlevar)) return BadRequest("Falta el nombre del cliente."); break;
        case 3: if (crearDto.ClienteId == null || crearDto.ClienteId <= 0) return BadRequest("Seleccione un cliente para el domicilio."); break;
        case 4:
          if (crearDto.ClienteId == null || crearDto.ClienteId <= 0) return BadRequest("Seleccione un cliente para la entrega.");
          if (crearDto.FechaHoraAgendada == null) return BadRequest("Falta la fecha y hora agendada.");
          break;
        case 5: if (crearDto.PlataformaId == null || crearDto.PlataformaId <= 0) return BadRequest("Seleccione la plataforma de origen."); break;
      }

      // 2. Calcular Totales Seguros
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

      int estatusInicial = (crearDto.TipoPedido == 4) ? 0 : 1;

      var nuevaComanda = new Comanda
      {
        TipoPedido = crearDto.TipoPedido,
        NumeroMesa = crearDto.NumeroMesa,
        NombreClienteLlevar = crearDto.NombreClienteLlevar,
        ClienteId = crearDto.ClienteId,
        FechaHoraAgendada = crearDto.FechaHoraAgendada,
        PlataformaId = crearDto.PlataformaId,
        Estatus = estatusInicial,
        Subtotal = totalCalculado,
        Total = totalCalculado,
        FechaRegistro = DateTime.UtcNow,
        Detalles = detallesList
      };

      if (!await _coRepo.CrearComandaAsync(nuevaComanda))
      {
        ModelState.AddModelError("", "Ocurrió un error al guardar la comanda.");
        return StatusCode(500, ModelState);
      }

      return Ok(new { mensaje = "Comanda creada exitosamente", comandaId = nuevaComanda.Id, estatus = estatusInicial });
    }

    // ==========================================
    // PATCH: Cambiar Estatus
    // ==========================================
    [HttpPatch("cambiarestatus/{comandaId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CambiarEstatus(int comandaId, [FromBody] int nuevoEstatus)
    {
      if (!await _coRepo.ExisteComandaAsync(comandaId))
        return NotFound();

      if (nuevoEstatus < 0 || nuevoEstatus > 3)
        return BadRequest("El estatus debe estar entre 0 y 3.");

      if (!await _coRepo.ActualizarEstatusComandaAsync(comandaId, nuevoEstatus))
      {
        ModelState.AddModelError("", "Error al actualizar el estatus de la comanda.");
        return StatusCode(500, ModelState);
      }

      return Ok(new { mensaje = "Estatus actualizado correctamente." });
    }

    // ==========================================
    // PATCH: Pagar Comanda (Caja Registradora)
    // ==========================================
    [HttpPatch("pagar/{comandaId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PagarComanda(int comandaId, [FromBody] int metodoPagoId)
    {
      if (!await _coRepo.ExisteComandaAsync(comandaId))
        return NotFound();

      var comanda = await _coRepo.GetComandaAsync(comandaId);

      if (comanda == null)
        return NotFound();

      // Asignamos el método de pago y pasamos el estatus a 3 (Pagado)
      comanda.MetodoPagoId = metodoPagoId;
      comanda.Estatus = 3;

      // Guardamos la comanda actualizada
      if (!await _coRepo.ActualizarComandaAsync(comanda))
      {
        ModelState.AddModelError("", "Error al procesar el pago de la comanda en la base de datos.");
        return StatusCode(500, ModelState);
      }

      return Ok(new { mensaje = "Cuenta cobrada exitosamente." });
    }



    // ==========================================
    // METODO PRIVADO: Mapeo manual a DTO
    // ==========================================
    private ComandaDto MapearComandaDto(Comanda comanda)
    {
      return new ComandaDto
      {
        Id = comanda.Id,
        TipoPedido = ObtenerNombreTipoPedido(comanda.TipoPedido),
        NumeroMesa = comanda.NumeroMesa,
        PlataformaNombre = comanda.Plataforma?.Nombre,
        DireccionEntrega = comanda.Cliente?.Direccion, // Asumiendo que Cliente tiene Dirección
        HoraEntrega = comanda.FechaHoraAgendada,
        Subtotal = comanda.Subtotal,
        Total = comanda.Total,
        FechaRegistro = comanda.FechaRegistro,
        Estado = ObtenerNombreEstatus(comanda.Estatus),
        Detalles = comanda.Detalles?.Select(d => new ComandaDetalleDto
        {
          Id = d.Id,
          PlatilloId = d.PlatilloId,
          PlatilloNombre = d.Platillo?.Nombre, // Esto funciona gracias al .ThenInclude()
          Cantidad = d.Cantidad,
          PrecioUnitario = d.PrecioUnitario,
          Subtotal = d.Subtotal,
          Notas = d.Notas
        }).ToList() ?? new List<ComandaDetalleDto>()
      };
    }

    private string ObtenerNombreTipoPedido(int tipo) => tipo switch
    {
      1 => "Local",
      2 => "Llevar",
      3 => "Domicilio",
      4 => "Agendado",
      5 => "Plataforma",
      _ => "Desconocido"
    };

    private string ObtenerNombreEstatus(int estatus) => estatus switch
    {
      0 => "Agendado",
      1 => "Cocinando",
      2 => "Entregado",
      3 => "Pagado",
      _ => "Desconocido"
    };
  }
}
