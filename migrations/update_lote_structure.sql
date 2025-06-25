-- Migración para actualizar la estructura de Lote
-- Cambiar IdCliente por IdPedido y crear nueva tabla de relación

-- 1. Crear la nueva tabla de relación LoteMateriaPrimaBase
CREATE TABLE LoteMateriaPrimaBase (
    IdLoteMateriaPrimaBase INT IDENTITY(1,1) PRIMARY KEY,
    IdLote INT NOT NULL,
    IdMateriaPrimaBase INT NOT NULL,
    Cantidad DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (IdLote) REFERENCES Lote(IdLote) ON DELETE CASCADE,
    FOREIGN KEY (IdMateriaPrimaBase) REFERENCES MateriaPrimaBase(IdMateriaPrimaBase) ON DELETE CASCADE
);

-- 2. Agregar la columna IdPedido a la tabla Lote
ALTER TABLE Lote ADD IdPedido INT;
ALTER TABLE Lote ADD CONSTRAINT FK_Lote_Pedido FOREIGN KEY (IdPedido) REFERENCES Pedido(IdPedido);

-- 3. Migrar datos existentes (si los hay)
-- Nota: Esto es opcional y depende de si ya tienes datos en la tabla Lote
-- Si tienes datos, necesitarás mapear IdCliente a IdPedido según tu lógica de negocio

-- 4. Eliminar la columna IdCliente (solo después de migrar los datos)
-- ALTER TABLE Lote DROP CONSTRAINT FK_Lote_Cliente; -- Si existe esta constraint
-- ALTER TABLE Lote DROP COLUMN IdCliente;

-- 5. Eliminar la tabla LoteMateriaPrima antigua (solo después de migrar los datos)
-- DROP TABLE LoteMateriaPrima;

-- Nota: Ejecuta estos comandos paso a paso y verifica que no haya errores
-- antes de eliminar las columnas/tablas antiguas 