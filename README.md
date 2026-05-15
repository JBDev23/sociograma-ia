# Sociograma IA

Este repositorio contiene el código fuente de Sociograma IA, un proyecto desarrollado en menos de una semana para el hackathon TechForEquality 2026, organizado por ACM UPV, para dar solución al reto propuesto por NTT Data.

El sistema está diseñado como un monorepo que facilita la creación, gestión y análisis de sociogramas, permitiendo evaluar las dinámicas sociales dentro de un grupo a través de formularios y visualizaciones de grafos.

## Despliegue

El proyecto se encuentra desplegado y accesible en: [sociograma-ia-frontend.vercel.app](https://sociograma-ia-frontend.vercel.app)

**Nota:** Las características de Inteligencia Artificial se encuentran actualmente desactivadas en el entorno de producción para evitar el consumo excesivo de tokens.

## Arquitectura y Tecnologías

El proyecto está estructurado como un monorepo gestionado con pnpm. La pila tecnológica se centra en el ecosistema web moderno:

* **Frontend:** Desarrollado con Next.js y React. Se utiliza TailwindCSS para los estilos y la librería `@xyflow/react` para la visualización interactiva de los grafos y redes sociales.
* **Backend:** Construido sobre NestJS. Se encarga de exponer la API REST y gestionar la lógica de negocio subyacente.
* **Base de Datos:** PostgreSQL gestionado a través del ORM Prisma.
* **Inteligencia Artificial:** Integración con Groq SDK para procesar datos y ofrecer análisis avanzados de las relaciones del sociograma.

## Características Principales

* **Gestión de Proyectos y Aulas:** Permite crear proyectos que agrupan a miembros (estudiantes) y guardar distribuciones físicas del aula en formato JSON.
* **Formularios Dinámicos:** Creación de formularios con diferentes estados (Borrador, Activo, Cerrado) para que los usuarios introduzcan sus elecciones de forma estructurada.
* **Mapeo de Relaciones:** Registro de relaciones direccionales entre miembros, categorizadas por tipo (Afinidad o Conflicto) y contexto (Trabajo o Juego) junto con un peso asociado.
* **Generación de Códigos QR:** Facilidad de acceso a los formularios compartidos mediante la librería `react-qr-code` integrada en el cliente.
