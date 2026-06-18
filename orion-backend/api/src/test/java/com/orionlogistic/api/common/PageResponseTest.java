package com.orionlogistic.api.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PageResponseTest {

    /** Jackson configurado como la app (snake_case global en application.properties). */
    private final ObjectMapper mapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    @Test
    void of_mapeaYserializaConElShapeDelContrato() throws Exception {
        var pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "creadoEn"));
        var page = new PageImpl<>(List.of("a", "b"), pageable, 312);

        PageResponse<String> res = PageResponse.of(page, s -> s.toUpperCase());

        assertThat(res.getContent()).containsExactly("A", "B");
        assertThat(res.getPage()).isZero();
        assertThat(res.getSize()).isEqualTo(20);
        assertThat(res.getTotalElements()).isEqualTo(312);
        assertThat(res.getTotalPages()).isEqualTo(16);

        // El JSON debe usar exactamente las claves que consume el front (doc 05b).
        String json = mapper.writeValueAsString(res);
        assertThat(json)
                .contains("\"content\"")
                .contains("\"total_elements\":312")
                .contains("\"total_pages\":16")
                .doesNotContain("totalElements")
                .doesNotContain("totalPages");
    }
}
