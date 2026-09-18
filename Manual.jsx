import ContentPage from "../components/ContentPage";

export default function Manual() {
  return (
    <ContentPage title="Manual de uso">
      <section>
        <h2 className="font-display text-xl text-ink mb-2">1. Crea tu cuenta</h2>
        <p>
          Regístrate con tu correo y una contraseña, o con un solo toque usando tu
          cuenta de Google. Tu biblioteca queda ligada a esa cuenta, así que puedes
          entrar desde tu computadora, tu teléfono o cualquier dispositivo con
          internet.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">2. Sube tus libros</h2>
        <p>
          Desde el botón "Subir libro" elige un archivo en formato EPUB o PDF. La
          app detecta automáticamente el título, el autor y la portada. El archivo
          se guarda de forma privada: solo tú puedes verlo.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">3. Organiza tu estantería</h2>
        <p>
          Crea estanterías (carpetas) como "Fantasía", "Saga de...", o lo que
          quieras. Un mismo libro puede vivir en varias estanterías a la vez.
          Usa el buscador para encontrar cualquier libro por título o autor.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">4. Lee cómodamente</h2>
        <p>
          Al abrir un libro puedes ajustar el tamaño de letra, el tipo de fuente y
          el modo de color (claro, oscuro o sepia). Tu progreso se guarda solo, así
          que si cierras la app y vuelves después —incluso desde otro
          dispositivo— continúas exactamente donde ibas.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">5. Marca tu progreso</h2>
        <p>
          Cada libro tiene un estado: "Por leer", "Leyendo" o "Terminado". Cámbialo
          en cualquier momento desde la tarjeta del libro.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">¿Problemas para entrar?</h2>
        <p>
          Usa "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión para
          recibir un enlace y crear una nueva.
        </p>
      </section>
    </ContentPage>
  );
}
