package com.orionlogistic.api.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Paginación con el shape exacto que consume el front (`Paginated<T>` del doc 05b):
 * { content, page, size, total_elements, total_pages }.
 * Se usa en vez de serializar {@link Page} directo (cuyos campos no coinciden).
 */
@Getter
@AllArgsConstructor
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    /** Construye la respuesta mapeando cada entidad de la página a su DTO. */
    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
