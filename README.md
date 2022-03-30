## Simple NodeJS Docker Application

This is a simple app to test and familiarize with docker following the step in the [freecodecamp.org](https://www.youtube.com/watch?v=9zUHg7xjIqQ&t=1862s) tutorial

### Steps

- Create a simple node app
- - `npm init`
- - `npm install express`
- - Create `index.js`

This creates a `node_modules` folder.

### Docker initial content

```docker
# take the official node16 image
FROM node:16

# Create app directory
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

# Bundle app source
COPY . ./

# Port to send traffic on the container.
# Application (Node APP) listening on port 3000.
EXPOSE 3000
CMD ["node", "index.js"]
```

### Docker commands

- Create the docker image. This creates an imge named crmorales/docker-node-testing with version 1.0

        `docker build . -t crmorales/docker-node-testing:1.0`

- Run the image as a docker container. For this, we have to specify the docker port and the application ports (`-p`), the `name` of the container image and the name of the running container `(--name)`

        `docker run -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

- Remove running container

        docker rm /node-app-testing -f

- Show docker process

        docker ps

- Look at the content inside the docker container. Once in the we can run an `ls` to see the content. We can see that the docekr container is basically our app, the same way we have it configure in our code editor (our pc)

        docker exec -it node-app-testing bash

- Insect logs for errors

        docker logs <app_name>

- Show stopped and running containers

        docker ps -a

### Change Dockerfile to update as code updates.

With the current config, the Dockerfile is configured to run a stalled code, this means, the Docker container runs the code that is built in the image, but does update with new changes. This is not good because we will have to kill the container and rebuild it every time we want to see the changes we made, this will slow downnnnnnn our developing time.

Workaround:

In Docker we have volumens. One of these volumes allows us to sync a folder or file system to a folder in our docker container. To do this we have to re run ou container specifying the volume `v`.

`docker run -v path_to_folder_in_local_machine:path_to_folder_in_docker_container -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

hard coded would be:

`docker run -v D:\Web Development\docker-testing\:/app -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

This looks a litle messy, so we can use variables.

- `docker run -v %cd%:/app -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`
- `docker run -v ${pwd}:/app -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0` for **pwsh**

This should work, but we have to do another thing in our local development, which install `nodemon`. Nodemon allows us to see changes in node during development, without having to restart our server every time we make a change

- `npm install nodemon --save-dev` as a de dependency

and then add it to the `package.json` in the scripts:

```json
"scripts": {
   "start": "node index.js",
   "dev": "nodemon -L index.js"
 },
```

now, we are not going to run `node index.js` anymore, instead, we are running `npm run dev`, so we have to change this in our Dockerfile

```docker
CMD ["npm", "run", "dev"]
```

At this point, we should be able to see changes in real time in our development. **Note that we are developing in our docker container and not in our local env.** So if we remove the `node_modules` local to our PC, we should not have any problems, however, we have to be carefull because we are using the `-v` flag, because this will delete the `node_modules` in our Docker Container.

To fix this, we can create a new volume to specify we don not want to remove the `node_modules` in our Docker container.

- `docker run -v ${pwd}:/app -v /app/node_modules -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

#### Make Docker Container as read only

- `docker run -v ${pwd}:/app:ro -v /app/node_modules -p 3000:3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

### Enviromental variables in our Docker Container

We have to add the enviromental variable to the Docker file as `ENV PORT <value>`. Then pass the port in the run command

- `docker run -v ${pwd}:/app:ro -v /app/node_modules -p 3000:3000 --env PORT=3000 -d --name node-app-testing crmorales/docker-node-testing:1.0`

Now, if we havemany enviromental variables, it get messy passing each variable through the console using the `--env VAR <value>` flag. We can instead create a file named .env and pass the file

- `docker run -v ${pwd}:/app:ro -v /app/node_modules -p 3000:3000 --env-file ./.env -d --name node-app-testing crmorales/docker-node-testing:1.0`

### Cleaning volumens

- `docker volume prune`
- `docker rm -fv node-app-testing`

## Docker Compose

At this point, we have to run a super long command, this is not cool, it is propense to errors, so, we are going to use a feature called docker compose.

```docker
version: "3.9"
services:
  docker-node-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
      - /app/node_modules
    #environment:
    #  - PORT=3000
    env_file:
      - ./.env
```

- The `version` is the docker version you want.
- `services` start describing the services you want to run (the containers)
- `docker-node-app` is the name of the app to build
- `build .` means build everything in the current directory
- `ports` describes the ports using `(localhost:container)`
- `volumes` is for the sync between folders, but in this case we do not have to use `${pwd}` to get the path, we can just use `./` to refer to the current folder. `./:/app` means sync this current dir to the /app one in the docker container. Also, the `/app/node_modules` is for ignore the `node_modules` folder, because we build it inside the container.

Then we have to run `docker-compose up -d` and to shut it down `docker-compose down -v`

When you make a change to the Dockerfile, docker compose needs to rebuild the image, but it does not do it by itself, we have to specify it with:

- `docker-compose up -d --build`. This forces a new build. This is only needed if we make changes to the image (Dockerfile)

## Separate set of commands for development and for production.

We can create separate Dockerfiles for development and for production. In production we don't want the sycn between folders, so we don't need the volumens, and there will be other parameters we have in development we don't want in prod, for example, in production we can run directly `npm start` or `node index.js` to start the app, in development we are using `npm run dev` to use `nodemon` and see changes happening.

So, we create a file named `docker-compose.dev.yml` for development, another named `docker-compose.prod.yml` and a common one, which is the `docker-compose.yml` file. The `docker-compose` file has the configuration that is common for both dev and prod.

```yml
# docker-compose.yml
version: "3.9"
services:
  docker-node-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
```

The `docker-compose.dev.yml` has the configuration for dev.

```yml
version: "3.9"
services:
  docker-node-app:
    build:
      context: .
      args:
        NODE_ENV: development
    volumes:
      - "./:/app"
      - "/app/node_modules"
    environment:
      - NODE_ENV=development
    command: npm run dev
```

And the `docker-compose.prod.yml` the configuration for production.

```yml
version: "3.9"
services:
  docker-node-app:
    build:
      context: .
      args:
        NODE_ENV: production
    environment:
      - NODE_ENV=production
    command: npm start
```

In `docker-compose.dev.yml` and `docker-compose.prod.yml` we specify the build. In the build parameter, `context` is the location, which is still `.`, and `args` are the arguments to pass to the Dockerfile. We do this because we are expecting this parameter in the Dockerfile to determine the enviroment (development or production) to run the correct command (`npm run dev` or `npm start`).

```docker
FROM node:16
WORKDIR /app
COPY package*.json .
RUN npm install

#Prepare our image to run different commands depending on the enviroment
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./
ENV PORT 3000
EXPOSE $PORT
CMD ["npm", "start"]
```

To run this, we can use the same `docker-compose up` command with a few tweaks. We have to pass the files to the command in order.

- `docker-compose up -f docker-compose.yml -f docker-compose.dev.yml -d`
- `docker-compose up -f docker-compose.yml -f docker-compose.prod.yml -d --build`. We need to specify `build` beacuse we removed the sync for production.
- `docker-compose down -f docker-compose.yml -f docker-compose.dev.yml -v`

## Adding another service

We are going to add another service now, specifically a mongoDB database. For this, we will use the original MongoDb image in DockerHub. We can specify this in the docker compose file. We specify the username and password of the database as enviromental variables

```yml
mongo:
  image: mongo # we are using the offical mongo image from docker hub
  environment:
    - MONGO_INITDB_ROOT_USERNAME=carlos
    - MONGO_INITDB_ROOT_PASSWORD=thepasswordis
```

Now, when we run the service `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d` we can see a new service with the name of the folder and mongo after the name of the folder. **Note** we don't need to rebuild because the **Dockerfile** has not changed, also, this will pull the Mongo image from dockerhub.

Pulling the MongoDB image means that an instance of MongoDb will be installed in our docker container.

We can inspect the new service by typing `docker exec -it docker-testing-mongo-1 bash`.

And inside the service (Container) we can connect to our database by typing `mongo -u "carlos" -p "thepasswordis"`. `-u` for username and `-p` for password.

We can create a new database with the `use` comamand, `use mydb` and play a little with the database

```mongo
use mydb
show dbs
db.books.insert({"name": "Harry Potter"})
db.books.find()
```

Alternatively we can just run `docker exec -it docker-testing-mongo-1 mongo -u "carlos" -p "thepasswordis"` and we will enter the database.

**NOTE:** Once we do a `docker-compose down` we will lose our database. This is a problem for our production enviroment. To solve this we use volumens.
Add the following line.

```yml
mongo:
  image: mongo # we are using the offical mongo image from docker hub
  environment:
    - MONGO_INITDB_ROOT_USERNAME=carlos
    - MONGO_INITDB_ROOT_PASSWORD=thepasswordis
  volumes:
    - mongo-db:/data/db

# declare the volumens
volumes:
  mongo-db:
```

In this case, we can't run `docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v` to kill our service because this will delete our mongo-db volume. **NOTE:** Can't run `-v` flag. So our anonymous volumes will accumulate and we have to remove them mannually by running `docker volume prune`.

To connect to the database we need the connection url. To see the IP address of our container we can run `docker inspect <app_name>` and search for network.

`mongodb://carlos:thepasswordis@192.168.0.2:27017/?authSource=admin`

```js
const CONNECTION_URL =
  "mongodb://carlos:thepasswordis@192.168.0.2:27017/?authSource=admin";

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error} did not connect`));
```

If we do a `docker network ls` we can see some networks. We can see the `bridge` and `host` networks, which are the defaults created with docker, and we can see another named `docker-testing_default`, this is the custom one created for our application. When we have a custom network, we have a DNS service, so, if we want to talk between containers, we can use the names of the containers (the names declared in the docker-compose file or service names)

```bash
PS D:\Web Development\docker-testing> docker network ls
NETWORK ID     NAME                     DRIVER    SCOPE
a3b9c3e14852   bridge                   bridge    local
d02dedc56f2b   docker-testing_default   bridge    local
967174efa7dd   host                     host      local
decec2ce90d7   none                     null      local
```

So now, we can use the DNS, insted of the IP address 192.168.0.2:

`"mongodb://carlos:thepasswordis@mongo:27017/?authSource=admin"`

We can check this is working by entering in the app `docker-testing-docker-node-app-1` and doing a `ping mongo`.

## Dependencies between components

`depends_on` can be used in the docker-file to specify which container should be runned first, in case one depends on the other.

### Connect using MongoDB Compass

`mongodb://<username>:<password>@localhost:<port>/?authSource=admin`

`mongodb://carlos:thepasswordis@localhost:27017/?authSource=admin`

We have to discover the ports in the `docker-compose.dev.yml`. We do not do this in production because we don't need to connect with other app to the database.

## Adding load balancer NGINX

<img src="./assets/Nginx load balance.png" />

**NOTE**: For production we have to configure the enviromental variables in the production machine and put them in the .gitignore file, so you don't upload them to github.

**NOTE**: We have to configure the env variables in the production machine, so docker grabs them from the local env, instead of being hardcoded, as they are in development. To configure env variables in a Linux machine we can use:

`export ENV_VARIABLE_NAME="hello"`

An alternative is to create a `.env` file in root typing: `vi .env` and add all the ENV variables in the file. Then, in the root folder open the `.profile` file and in the bottom, create a new instruction: `set -o allexport; source /root/.env set -o allexport`. Close and reopen the terminal and type `printenv` to see the variables.

For deployment, we can clone the repo and run `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`.

To update changes in production after build, we can run `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` again after pulling for changes in the repository. We can add the `--no-deps` if we don't want to rebuild the databases and other services that wont change in development.

To re-build the container, for whatever reason, we can pass the `--force-recreate --no-deps`. Now, this workflowis not optimal since we have to rebuild in the production server. Instead, we are going to upload the finalized image to Dockerhub and pull the built image in production.
