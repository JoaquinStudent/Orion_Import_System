package com.orionlogistic.api.finanzas;

import com.orionlogistic.api.pedidos.Pedido;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

/** Genera el reporte de pedidos en formato .xlsx (Apache POI). */
@Component
public class ExcelExporter {

    private static final String[] COLUMNAS =
            {"N° Orden", "Tracking", "Titular", "Estado", "Costo USD", "Fecha"};

    public byte[] reportePedidos(List<Pedido> pedidos) {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Pedidos");

            CellStyle bold = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            bold.setFont(font);

            Row header = sheet.createRow(0);
            for (int i = 0; i < COLUMNAS.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(COLUMNAS[i]);
                c.setCellStyle(bold);
            }

            int fila = 1;
            BigDecimal total = BigDecimal.ZERO;
            for (Pedido p : pedidos) {
                BigDecimal costo = p.getCostoImportacionUsd() != null
                        ? p.getCostoImportacionUsd() : BigDecimal.ZERO;
                total = total.add(costo);

                Row row = sheet.createRow(fila++);
                row.createCell(0).setCellValue(p.getNumOrden());
                row.createCell(1).setCellValue(p.getNumTracking());
                row.createCell(2).setCellValue(p.getTitular());
                row.createCell(3).setCellValue(p.getEstado() != null ? p.getEstado().getNombre() : "");
                row.createCell(4).setCellValue(costo.doubleValue());
                row.createCell(5).setCellValue(
                        p.getCreadoEn() != null ? p.getCreadoEn().toLocalDate().toString() : "");
            }

            Row totalRow = sheet.createRow(fila);
            Cell etiqueta = totalRow.createCell(3);
            etiqueta.setCellValue("Total");
            etiqueta.setCellStyle(bold);
            Cell totalCell = totalRow.createCell(4);
            totalCell.setCellValue(total.doubleValue());
            totalCell.setCellStyle(bold);

            for (int i = 0; i < COLUMNAS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo generar el reporte Excel", e);
        }
    }
}
