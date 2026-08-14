using FlowFood.Models;
using FlowFood.Models.Dtos;
using FlowFood.Repositorio.IRepositorio;
using Microsoft.AspNetCore.Mvc;

namespace FlowFood.Controllers
{
    [Route("flowfood/[controller]")]
    [ApiController]
    public class PlatilloController : ControllerBase
    {
        private readonly IPlatilloRepositorio _platRepo;

        public PlatilloController(IPlatilloRepositorio platRepo)
        {
            _platRepo = platRepo;
        }

        // GET: flowfood/Platillo/Listar
        [HttpGet("Listar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetPlatillos()
        {
            var listaPlatillos = await _platRepo.GetPlatillosAsync();
            var listaDto = listaPlatillos.Select(MapearPlatilloDto).ToList();

            return Ok(listaDto);
        }

        // GET: flowfood/Platillo/Buscar/{id}
        [HttpGet("Buscar/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPlatillo(int id)
        {
            if (!await _platRepo.ExistePlatilloAsync(id))
                return NotFound();

            var platillo = await _platRepo.GetPlatilloAsync(id);
            return Ok(MapearPlatilloDto(platillo));
        }

        // GET: flowfood/Platillo/BuscarPorCodigo/{codigo}
        // Este es el que usara el lector de codigo de barras
        [HttpGet("BuscarPorCodigo/{codigo}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPlatilloPorCodigo(string codigo)
        {
            if (!await _platRepo.ExistePlatilloXCodigoAsync(codigo))
                return NotFound();

            var platillo = await _platRepo.GetPlatilloXCodigoAsync(codigo);
            return Ok(MapearPlatilloDto(platillo));
        }

        // POST: flowfood/Platillo/Guardar
        [HttpPost("Guardar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GuardarPlatillo([FromForm] CrearPlatilloDto crearPlatilloDto)
        {
            if (crearPlatilloDto == null)
                return BadRequest(ModelState);

            // Validamos la imagen
            if (crearPlatilloDto.Foto == null || crearPlatilloDto.Foto.Length == 0)
            {
                ModelState.AddModelError("", "Debe adjuntar una foto del platillo");
                return StatusCode(400, ModelState);
            }

            var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(crearPlatilloDto.Foto.FileName).ToLowerInvariant();

            if (!extensionesPermitidas.Contains(extension))
            {
                ModelState.AddModelError("", "Formato de imagen no permitido. Solo JPG o PNG");
                return StatusCode(400, ModelState);
            }

            // Guardamos la foto fisicamente en wwwroot/platillos
            var carpetaDestino = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "platillos");
            if (!Directory.Exists(carpetaDestino))
                Directory.CreateDirectory(carpetaDestino);

            var nombreArchivo = $"{Guid.NewGuid()}{extension}";
            var rutaCompleta = Path.Combine(carpetaDestino, nombreArchivo);

            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await crearPlatilloDto.Foto.CopyToAsync(stream);
            }

            var rutaRelativa = $"/platillos/{nombreArchivo}";

            // Generamos el codigo consecutivo
            var codigoGenerado = await _platRepo.GenerarSiguienteCodigoAsync();

            var nuevoPlatillo = new Platillo
            {
                Nombre = crearPlatilloDto.Nombre,
                Descripcion = crearPlatilloDto.Descripcion,
                Precio = crearPlatilloDto.Precio,
                Codigo = codigoGenerado,
                FotoUrl = rutaRelativa,
                FechaRegistro = DateTime.UtcNow,
                Estado = true
            };

            if (!await _platRepo.CrearPlatilloAsync(nuevoPlatillo))
            {
                // Si algo sale mal guardando en BD, borramos la foto huerfana
                if (System.IO.File.Exists(rutaCompleta))
                    System.IO.File.Delete(rutaCompleta);

                ModelState.AddModelError("", $"Algo salió mal al guardar el registro de {nuevoPlatillo.Nombre}");
                return StatusCode(500, ModelState);
            }

            return Ok(MapearPlatilloDto(nuevoPlatillo));
        }

        // PUT: flowfood/Platillo/Actualizar/{id}
        [HttpPut("Actualizar/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ActualizarPlatillo(int id, [FromForm] ActualizarPlatilloDto actualizarDto)
        {
            if (actualizarDto == null || id != actualizarDto.Id)
                return BadRequest(ModelState);

            if (!await _platRepo.ExistePlatilloAsync(id))
                return NotFound();

            var platilloActual = await _platRepo.GetPlatilloAsync(id);

            // Por defecto conservamos la foto actual
            var rutaFotoFinal = platilloActual.FotoUrl;
            string rutaFotoAnteriorParaBorrar = null;

            // Si viene una foto nueva, la validamos y guardamos
            if (actualizarDto.Foto != null && actualizarDto.Foto.Length > 0)
            {
                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(actualizarDto.Foto.FileName).ToLowerInvariant();

                if (!extensionesPermitidas.Contains(extension))
                {
                    ModelState.AddModelError("", "Formato de imagen no permitido. Solo JPG o PNG");
                    return StatusCode(400, ModelState);
                }

                var carpetaDestino = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "platillos");
                if (!Directory.Exists(carpetaDestino))
                    Directory.CreateDirectory(carpetaDestino);

                var nombreArchivo = $"{Guid.NewGuid()}{extension}";
                var rutaCompleta = Path.Combine(carpetaDestino, nombreArchivo);

                using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                {
                    await actualizarDto.Foto.CopyToAsync(stream);
                }

                rutaFotoAnteriorParaBorrar = platilloActual.FotoUrl;
                rutaFotoFinal = $"/platillos/{nombreArchivo}";
            }

            var platilloActualizar = new Platillo
            {
                Id = actualizarDto.Id,
                Nombre = actualizarDto.Nombre,
                Descripcion = actualizarDto.Descripcion,
                Precio = actualizarDto.Precio,
                Codigo = platilloActual.Codigo,             // nunca cambia
                FotoUrl = rutaFotoFinal,
                FechaRegistro = platilloActual.FechaRegistro, // nunca cambia
                Estado = actualizarDto.Estado
            };

            if (!await _platRepo.ActualizarPlatilloAsync(platilloActualizar))
            {
                // Si fallo el update y habiamos subido una foto nueva, la borramos (quedaria huerfana)
                if (rutaFotoAnteriorParaBorrar != null)
                {
                    var rutaFisicaNueva = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rutaFotoFinal.TrimStart('/'));
                    if (System.IO.File.Exists(rutaFisicaNueva))
                        System.IO.File.Delete(rutaFisicaNueva);
                }

                ModelState.AddModelError("", $"Algo salió mal actualizando el registro de {platilloActualizar.Nombre}");
                return StatusCode(500, ModelState);
            }

            // Si el update fue exitoso y habia una foto anterior, ahora si la borramos
            if (rutaFotoAnteriorParaBorrar != null)
            {
                var rutaFisicaAnterior = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rutaFotoAnteriorParaBorrar.TrimStart('/'));
                if (System.IO.File.Exists(rutaFisicaAnterior))
                    System.IO.File.Delete(rutaFisicaAnterior);
            }

            return Ok(MapearPlatilloDto(platilloActualizar));
        }

        // DELETE: flowfood/Platillo/Eliminar/{id}
        [HttpDelete("Eliminar/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> EliminarPlatillo(int id)
        {
            if (!await _platRepo.ExistePlatilloAsync(id))
                return NotFound();

            var platilloAEliminar = await _platRepo.GetPlatilloAsync(id);

            if (!await _platRepo.BorrarPlatilloAsync(platilloAEliminar))
            {
                ModelState.AddModelError("", $"Algo salió mal borrando el registro de {platilloAEliminar.Nombre}");
                return StatusCode(500, ModelState);
            }

            return NoContent();
        }

        private PlatilloDto MapearPlatilloDto(Platillo platillo)
        {
            return new PlatilloDto
            {
                Id = platillo.Id,
                Nombre = platillo.Nombre,
                Descripcion = platillo.Descripcion,
                Precio = platillo.Precio,
                Codigo = platillo.Codigo,
                FotoUrl = platillo.FotoUrl,
                FechaRegistro = platillo.FechaRegistro,
                Estado = platillo.Estado
            };
        }
    }
}
