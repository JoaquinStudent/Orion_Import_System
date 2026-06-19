package com.orionlogistic.api.dashboard;

import com.orionlogistic.api.common.ApiResponse;
import com.orionlogistic.api.dashboard.dto.DashboardResumenResponse;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Resumen del panel principal (requiere permiso de lectura de pedidos). */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<DashboardResumenResponse>> resumen(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.resumen(usuario)));
    }
}
