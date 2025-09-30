## Ejecución de pruebas con Postman

### 1. Instala Postman

Descarga e instala [Postman](vscode-file://vscode-app/c:/Users/USUARIO/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) si aún no lo tienes.

### 2. Importa la colección de pruebas

1. Abre Postman.
2. Haz clic en el botón **"Import"** (arriba a la izquierda).
3. Selecciona la pestaña **"File"**.
4. Haz clic en **"Choose Files"** y selecciona el archivo de colección que deseas importar, por ejemplo:
    - [POSTMAN_Deployment_tests.postman_collection.json](vscode-file://vscode-app/c:/Users/USUARIO/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
5. Haz clic en **"Import"**.

### 3. Configura las variables de entorno

Algunas colecciones usan variables como `base_url`, `base_url_deploy` o `baseUrl`.  
Crea una variable de entorno en Postman con el valor correspondiente, por ejemplo:

Auth-Users
- `base_url_deploy` = `https://workshop-1-comp3.onrender.com`
Membership-Subscriptions-Attendance
- `baseUrl` = `https://workshop-1-comp3.onrender.com`

### 4. Ejecuta las pruebas

1. Selecciona la colección importada en el panel izquierdo.
2. Haz clic en el botón **"Run"** o selecciona las peticiones que deseas probar.
3. Observa los resultados en la pestaña de "Tests" de cada petición.

Variables de entorno:
![alt text](image.png)

![alt text](image-1.png)

![alt text](image-2.png)

![alt text](image-3.png)