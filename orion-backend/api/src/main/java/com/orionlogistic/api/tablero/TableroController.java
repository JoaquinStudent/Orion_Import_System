package com.orionlogistic.api.tablero;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.tablero.dto.TableroColumnaResponse;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tablero")
@RequiredArgsConstructor
public class TableroController {

    private final TableroService tableroService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableroColumnaResponse>>> obtener(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(tableroService.obtener(usuario)));
    }
}
