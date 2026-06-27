package com.orionlogistic.api.comunidades;

import com.orionlogistic.api.comunidades.dto.ComunidadRequest;
import com.orionlogistic.api.comunidades.dto.ComunidadResponse;
import com.orionlogistic.api.common.DuplicadoException;
import com.orionlogistic.api.common.NotFoundException;
import com.orionlogistic.api.common.PermisoChecker;
import com.orionlogistic.api.usuarios.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Catálogo de comunidades. Las mutaciones exigen permiso de "configuracion". */
@Service
@RequiredArgsConstructor
public class ComunidadService {

    private static final String MODULO = "configuracion";

    private final ComunidadRepository repository;
    private final PermisoChecker permisoChecker;

    @Transactional(readOnly = true)
    public List<ComunidadResponse> listar() {
        return repository.findAllByOrderByNombreAsc().stream()
                .map(ComunidadResponse::from)
                .toList();
    }

    @Transactional
    public ComunidadResponse crear(ComunidadRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        String nombre = req.getNombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new DuplicadoException("Ya existe una comunidad con ese nombre");
        }
        String codigo = normalizarCodigo(req.getCodigo());
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new DuplicadoException("Ya existe una comunidad con ese código");
        }
        Comunidad c = Comunidad.builder().nombre(nombre).codigo(codigo).activo(true).build();
        return ComunidadResponse.from(repository.save(c));
    }

    @Transactional
    public ComunidadResponse actualizar(Long id, ComunidadRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Comunidad c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comunidad no encontrada"));
        String nombre = req.getNombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new DuplicadoException("Ya existe una comunidad con ese nombre");
        }
        String codigo = normalizarCodigo(req.getCodigo());
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, id)) {
            throw new DuplicadoException("Ya existe una comunidad con ese código");
        }
        c.setNombre(nombre);
        c.setCodigo(codigo);
        return ComunidadResponse.from(repository.save(c));
    }

    private static String normalizarCodigo(String codigo) {
        if (codigo == null) return null;
        String t = codigo.trim();
        return t.isEmpty() ? null : t;
    }

    @Transactional
    public void eliminar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Comunidad c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comunidad no encontrada"));
        repository.delete(c);
    }
}
