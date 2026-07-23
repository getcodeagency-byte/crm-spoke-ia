# spoke! - Guía de Arquitectura y Despliegue

*Desde la perspectiva de un Arquitecto de Software, Diseñador UX y Experto en Bases de Datos con más de un siglo de experiencia combinada.*

---

## 1. Filosofía y Visión General

`spoke-crm` es más que un simple CRM; es una plataforma de **Inteligencia Comercial Omnicanal**. Nuestra filosofía se basa en tres pilares:

*   **Claridad y Simplicidad (UX):** La interfaz debe ser tan intuitiva que no requiera manual de usuario. Cada interacción está diseñada para ser fluida, predecible y eficiente, permitiendo que los equipos comerciales se centren en vender, no en luchar contra el software.
*   **Robustez y Escalabilidad (Backend):** La arquitectura del servidor está diseñada para ser un núcleo sólido, confiable y preparado para crecer. Utilizamos tecnologías probadas en batalla que garantizan un rendimiento estable y una capacidad de expansión casi ilimitada.
*   **El Dato es el Rey (Base de Datos):** Concebimos la base de datos no como un mero almacén, sino como el corazón estratégico del sistema. La estructura está optimizada para la integridad, la velocidad y, sobre todo, para facilitar la extracción de inteligencia de negocio.

## 2. Arquitectura del Proyecto

Hemos optado por una arquitectura monolítica desacoplada en su presentación, simple y efectiva, ideal para un desarrollo rápido y un mantenimiento sencillo.

*   **Frontend (`/frontend`):**
    *   **Tecnología:** HTML, CSS y JavaScript vainilla.
    *   **Filosofía:** Carga rápida y compatibilidad universal. No se utilizan frameworks complejos para garantizar que el widget y el CRM core sean ligeros y se puedan integrar en cualquier entorno sin conflictos.
    *   **Archivos Clave:**
        *   `index.html`: El punto de entrada de la aplicación principal.
        *   `css/styles.css`: Estilos visuales del CRM.
        *   `js/crm-core.js`: Lógica de negocio del lado del cliente.

*   **Backend (`/backend`):**
    *   **Tecnología:** Node.js con Express.
    *   **Filosofía:** Un API backend minimalista pero potente. Su única responsabilidad es servir la aplicación y proporcionar puntos de conexión seguros y eficientes con la base de datos.
    *   **Archivos Clave:**
        *   `server.js`: Orquesta el servidor, sirve los archivos estáticos y define las rutas de la API.
        *   `config/database.js`: Gestiona el pool de conexiones a la base de datos, una pieza crítica para el rendimiento.

## 3. Configuración del Entorno

La configuración se gestiona a través de variables de entorno para una máxima seguridad y portabilidad entre entornos (desarrollo, staging, producción).

1.  **Crear el archivo de entorno:**
    Crea una copia del archivo `.env.example` y renómbrala a `.env`.

    ```bash
    cp .env.example .env
    ```

2.  **Configurar las variables:**
    Edita el archivo `.env` con los detalles de tu entorno.

    ```dotenv
    # Puerto en el que correrá el servidor Node.js
    PORT=3000

    # Credenciales y detalles de la base de datos PostgreSQL
    DB_HOST=localhost         # Host de la base de datos
    DB_PORT=5432              # Puerto de la base de datos (PostgreSQL por defecto es 5432)
    DB_USER=tu_usuario_pg     # Usuario con permisos sobre la base de datos
    DB_PASSWORD=tu_password_segura # Contraseña del usuario
    DB_NAME=spoke_db          # Nombre de la base de datos
    ```

    **Nota de Experto:** Nunca, bajo ninguna circunstancia, subas el archivo `.env` a un repositorio de código. Es tu cofre de secretos.

## 4. Base de Datos: El Corazón del Sistema

Utilizamos **PostgreSQL**, una elección deliberada por su robustez, extensibilidad y fiabilidad legendaria.

1.  **Instalación:**
    Asegúrate de tener PostgreSQL instalado y corriendo en tu máquina o en un contenedor Docker.

2.  **Creación de la Base de Datos y Usuario:**
    Conéctate a tu instancia de PostgreSQL y ejecuta los siguientes comandos SQL para crear la base de datos y el usuario que `spoke-crm` utilizará.

    ```sql
    CREATE DATABASE spoke_db;
    CREATE USER tu_usuario_pg WITH PASSWORD 'tu_password_segura';
    GRANT ALL PRIVILEGES ON DATABASE spoke_db TO tu_usuario_pg;
    ```

3.  **Migración del Esquema:**
    Una vez que la base de datos está creada y las variables de entorno configuradas, ejecuta el script de migración para crear las tablas y estructuras necesarias.

    ```bash
    npm run migrate
    ```
    Este comando ejecutará el contenido de `backend/db/migrations/001_init_schema.sql` y `backend/db/migrations/seed.sql`.

## 5. Puesta en Marcha

Con todo configurado, lanzar el proyecto es un proceso sencillo.

1.  **Instalar Dependencias:**
    Abre una terminal en la raíz del proyecto e instala las dependencias de Node.js.

    ```bash
    npm install
    ```

2.  **Iniciar el Servidor:**
    Ejecuta el script de inicio.

    ```bash
    npm start
    ```

    Si todo ha ido bien, verás un mensaje de confirmación en la consola:
    ```
    =============================================
    🚀 Servidor de spoke! corriendo en el puerto 3000
    👉 Visita: http://localhost:3000
    =============================================
    ```

Ahora puedes acceder a la aplicación en tu navegador. El endpoint `/api/health` te servirá como un chequeo rápido para confirmar que el servidor y la base de datos están comunicándose correctamente.

---
*Esta guía es un documento vivo. A medida que el proyecto evolucione, también lo hará su arquitectura. Mantenla actualizada, respétala y construirás software del que estarás orgulloso.*
