package com.orionlogistic.api.auth;

import com.orionlogistic.api.auth.dto.LoginRequest;
import com.orionlogistic.api.auth.dto.LoginResponse;
import com.orionlogistic.api.usuarios.Permiso;
import com.orionlogistic.api.usuarios.PermisoRepository;
import com.orionlogistic.api.usuarios.Usuario;
import com.orionlogistic.api.usuarios.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock PermisoRepository permisoRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;

    @InjectMocks AuthService authService;

    private LoginRequest login(String email) {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("secret");
        return req;
    }

    @Test
    void login_admin_devuelvePermisosVacios() {
        Usuario admin = Usuario.builder()
                .id(1L).email("admin@orion.com").rol("ADMIN")
                .passwordHash("hash").activo(true).passwordTemporal(false).build();
        when(usuarioRepository.findByEmail("admin@orion.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("tok");

        LoginResponse res = authService.login(login("admin@orion.com"));

        assertThat(res.getUsuario().getPermisos()).isEmpty();
        verify(permisoRepository, never()).findByUsuarioId(any());
    }

    @Test
    void login_empleado_incluyeSusPermisos() {
        Usuario empleado = Usuario.builder()
                .id(2L).email("maria@orion.com").rol("EMPLEADO")
                .passwordHash("hash").activo(true).passwordTemporal(false).build();
        Permiso p = Permiso.builder()
                .modulo("pedidos").puedeVer(true).puedeEditar(true).build();
        when(usuarioRepository.findByEmail("maria@orion.com"))
                .thenReturn(Optional.of(empleado));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("tok");
        when(permisoRepository.findByUsuarioId(2L)).thenReturn(List.of(p));

        LoginResponse res = authService.login(login("maria@orion.com"));

        assertThat(res.getUsuario().getPermisos()).hasSize(1);
        assertThat(res.getUsuario().getPermisos().get(0).getModulo()).isEqualTo("pedidos");
        assertThat(res.getUsuario().getPermisos().get(0).isPuedeEditar()).isTrue();
    }
}
