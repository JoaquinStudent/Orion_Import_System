package com.orionlogistic.api.pedidos;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.common.PageResponse;
import com.orionlogistic.api.pedidos.dto.*;
import com.orionlogistic.api.usuarios.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PedidoListItemResponse>>> listar(
            @RequestParam(name = "estado_id", required = false) Long estadoId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal Usuario usuario) {
        PageResponse<PedidoListItemResponse> data =
                pedidoService.listar(estadoId, search, page, size, usuario);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PedidoDetailResponse>> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.obtener(id, usuario)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PedidoDetailResponse>> crear(
            @Valid @RequestBody PedidoRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        PedidoDetailResponse data = pedidoService.crear(req, usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "Pedido creado"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PedidoDetailResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PedidoRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        PedidoDetailResponse data = pedidoService.actualizar(id, req, usuario);
        return ResponseEntity.ok(ApiResponse.ok(data, "Pedido actualizado"));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<PedidoDetailResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        PedidoDetailResponse data =
                pedidoService.cambiarEstado(id, req.getEstadoId(), usuario);
        return ResponseEntity.ok(ApiResponse.ok(data, "Estado actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        pedidoService.eliminar(id, usuario);
        return ResponseEntity.ok(ApiResponse.ok(null, "Pedido eliminado"));
    }
}
