# E-commerce Mueblería Hermanos Jota

---

## Grupo 11 - Code Breakers

- **Fabrizio, Jazmin Maia** 
- **Gentille, Agostina Abril** 
- **Giménez, Agustín José** 
- **Insaurralde, Mariano Gastón** 
- **Vila, Juan Manuel** 

---

## Descripción del Proyecto

Este proyecto forma parte de los Sprints 5 y 6 del programa NEXUS, en el cual se desarrolló un sistema full-stack MERN (MongoDB, Express, React, Node.js) con persistencia de datos en la nube.

El objetivo principal fue construir un e-commerce funcional para la gestión de una mueblería, implementando:

* CRUD completo de productos
* Sistema de ruteo con React Router
* Formularios controlados
* Conexión real a MongoDB Atlas
* Despliegue del Backend en Render y Frontend en Vercel

### Funcionalidades del Proyecto

**Backend (API con Node + Express + MongoDB)**
* Conexión a MongoDB Atlas mediante variables de entorno
* Modelo Product con Mongoose (nombre, descripción, precio, stock, imagen)
* CRUD completo de productos
* Middlewares de logging y manejo de errores
* Validación básica de datos

**Frontend (React)**
* Navegación con React Router
* Consumo de la API real con fetch
* Manejo de estados de carga y error
* Formularios controlados para creación y edición
* Redirección con useNavigate luego de acciones (crear/eliminar)
* Confirmación de borrado de productos
* ReCAPTCHA para validaciones de acciones del usuario

---

## Tecnologías Utilizadas

### Frontend
- **React** → Arquitectura de componentes, hooks (`useState`, `useEffect`), props y manejo de estado.
- **CSS3 (Flexbox + Responsive)** → Estilos responsivos y maquetación moderna.
- **React Router** → Navegación entre páginas y rutas dinámicas.
- **Fetch API** → Comunicación con el backend.

### Backend
- **Node.js** → Servidor y entorno de ejecución.
- **Express.js** → Creación de la API REST, rutas modulares y middlewares.
- **Middlewares Personalizados** → Logging de peticiones y manejo de errores.
- **Mongoose y MongoDB Atlas** → Modelado de datos y persistencia en la base de datos en la nube.
- **JWT y ReCAPTCHA** --> Seguridad básica

### Despliegue
- **Frontend**: Vercel
- **Backend**: Render
- **Base de datos**: MongoDB Atlas

### Control de Versiones
- **Git & GitHub** → Repositorio único tipo monorepo con carpetas `/client` y `/backend`.

---

## Estructura del Proyecto
```
/backend    → API Express (Backend)
/client     → Aplicación React (Frontend)
.env        → Variables de entorno (no se sube al repo)
```
### Flujo general del sistema

```mermaid
flowchart LR
  A[React Client] ==> B[Express API]
  B ==> A
  B ==> C[MongoDB Atlas]
  C ==> B
```

---

## Enlaces 

### Render para el Backend
```
https://hermanosjota-sprint5y6.onrender.com/api
```
### Vercel para el Frontend
```
https://hermanosjotasprint5y6.vercel.app/
```
---

## Cómo configurar las variables de entorno (para despliegue local)

1. **Clonar Respositorio.**

2. **Instalar Dependencias (desde la terminal):**

   1. cd backend

   2. npm install

   3. cd ../client

   4. npm install

4. **Configurar las variables de entorno:**

   - En /backend/.env: 
      - MONGO_URI=mongodb+srv://hermanosjota:hermanosjota@cluster0.xsxpb32.mongodb.net/catalogo?retryWrites=true&w=majority
      - RECAPTCHA_SECRET=6Lc9o90rAAAAAA0IXzg7Go0XXsR1_ofbSY7ZdHjC
      - JWT_SECRET=secreto123

   - En /client/.env: 
      - REACT_APP_API_URL=https://hermanosjota-sprint5y6.onrender.com/api
      - REACT_APP_RECAPTCHA_SITE_KEY=6Lc9o90rAAAAADh0SuIy0-tPHxQkKkqA7HRTzUqh

5. **Ejecutar los servidores.**

   - **Backend:**
      1. cd backend 
      2. npm run dev

   - **Client:** 
      1. cd client 
      2. npm start

---
