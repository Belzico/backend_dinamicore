# Fintech API - Examen Práctico Backend

Este proyecto representa una solución completa al ejercicio práctico propuesto para desarrollador backend, centrado en el diseño y construcción de una API REST para una plataforma financiera. La implementación se realizó con Node.js y PostgreSQL, cumpliendo con todos los requerimientos funcionales y de seguridad establecidos en el **Ejercicio 4** del enunciado.

---

## 📌 Endpoints Implementados

### Autenticación de Usuarios
- `POST /auth/register`: Registro de nuevos usuarios.
- `POST /auth/login`: Inicio de sesión y generación de JWT.

### Manejo de Wallets
- `POST /wallets`: Crea una nueva wallet para el usuario autenticado.
- `GET /wallets`: Muestra todas las wallets del usuario autenticado.
- `GET /wallets/:id/history`: Historial de transacciones para una wallet específica.

### Procesamiento de Transacciones
- `POST /transactions/deposit`: Realiza un depósito en una wallet del usuario.
- `POST /transactions/withdraw`: Realiza un retiro desde una wallet del usuario.
- `POST /transactions/transfer`: Realiza una transferencia entre wallets.

### Gestión de Créditos
- `POST /credits/apply`: Solicita un crédito.
- `GET /credits/my`: Visualiza los créditos solicitados por el usuario.
- `POST /credits/:id/pay`: Realiza el pago de un crédito.
- `PUT /credits/:id/approve`: Aprueba un crédito (admin).
- `PUT /credits/:id/decline`: Rechaza un crédito (admin).
- `PUT /credits/:id/default`: Marca un crédito como incumplido (admin).
- `GET /credits`: Visualiza todos los créditos del sistema (admin).
- `GET /credits/dashboard`: Dashboard resumen de créditos (admin).

### Auditoría
- `GET /audit-log`: Muestra las últimas operaciones críticas del sistema (admin).

---

## ✅ Requisitos Cumplidos

- **Validación rigurosa de datos**: Uso de `express-validator` para registro y login.
- **Manejo de errores y códigos HTTP**: Todos los endpoints responden con códigos significativos (200, 400, 401, 403, 404, 500).
- **Documentación Postman**: Se incluye el archivo `fintech_api.postman_collection.json` en la raíz del proyecto.
- **JWT y manejo de roles**: Cada token incluye el rol del usuario (`user` o `admin`).
- **Rate Limiting**: Implementado con `express-rate-limit` para prevenir ataques.
- **Seguridad**: Uso de `helmet` para cabeceras y `cors` para control de acceso.
- **Auditoría**: Operaciones sensibles como transacciones y pagos de crédito quedan registradas en la tabla `audit_log`.

---

## ▶️ Instrucciones para correr el proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/backend_dinamicore.git
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo `.env` en la raíz con las variables necesarias:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_clave
   DB_NAME=fintech
   JWT_SECRET=tu_secreto_seguro
   ```

4. Crear la base de datos y ejecutar el script `schema.sql` para crear las tablas.

5. Iniciar el servidor:
   ```bash
   node src/index.js
   ```

6. Importar la colección de Postman (`fintech_api.postman_collection.json`) para probar los endpoints.

---

## ℹ️ Notas Finales

Se cubrieron todas las funcionalidades exigidas, agregando además características avanzadas como auditoría de operaciones y control de concurrencia en operaciones financieras. La arquitectura sigue el patrón RESTful, con middleware para validación, autenticación y control de roles. El código es modular, extensible y fácil de mantener.

---

**Desarrollado como parte del examen práctico de Backend - Plataforma Fintech**