# NodeJS workshop

* Luis Manuel Rojas Correa
* Santiago Angel Ordoñez
* Cristian
* Juan Camilo Corrales Osvath

## como correr la imagen de docker para usar mongo

1. crear el archivo .env en la raiz del proyecto

```bash
cd workshop_1_comp3

touch .env
```

2. meter en el archivo .env las variables de entorno necesarias (estan en el whatsapp)

3. una vez hecho eso, abrir docker desktop en sus pcs y correr el comando

```bash
docker compose up -d
```

(en la raiz del proyecto)

4. abrir mongo compass
5. seleccionar crear una nueva conexion
6. en la uri, colocar


```bash
mongodb://localhost:27018
```
7. seleccionar advanced connection options

8. seleccionar `Authentication`

9. en username y password colocar la info del .env

10. save & connect.

11. estamps readys
