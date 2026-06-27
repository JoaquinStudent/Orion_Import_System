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

    /** Nombres de las comunidades activas (combobox del registro público). */
    @Transactional(readOnly = true)
    public List<String> listarPublicas() {
        return repository.findByActivoTrueOrderByNombreAsc().stream()
                .map(Comunidad::getNombre)
                .toList();
    }

    @Transactional
    public ComunidadResponse crear(ComunidadRequest req, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        String nombre = req.getNombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new DuplicadoException("Ya existe una comunidad con ese nombre");
        }
        Comunidad c = Comunidad.builder().nombre(nombre).activo(true).build();
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
        c.setNombre(nombre);
        return ComunidadResponse.from(repository.save(c));
    }

    @Transactional
    public void eliminar(Long id, Usuario usuario) {
        permisoChecker.exigirEditar(usuario, MODULO);
        Comunidad c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Comunidad no encontrada"));
        repository.delete(c);
    }
}
