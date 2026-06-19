package com.orionlogistic.api.rastreo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** Resultado del rastreo (doc 05.9). Coincide con el front types/rastreo.ts. */
@Getter @AllArgsConstructor
public class RastreoResponse {

    private String titular;
    private String consignatario;
    private String comunidad;
    private List<ProductoRastreo> productos;
    private String estadoActual;
    private List<Paso> estados;
    private String tipoEnvio;
    private boolean puedeElegirEnvio;

    @Getter @AllArgsConstructor
    public static class ProductoRastreo {
        private Integer cantidad;
        private String producto;
        private String marca;
    }

    @Getter @AllArgsConstructor
    public static class Paso {
        private String nombre;
        private boolean completado;
        private boolean activo;
    }
}
