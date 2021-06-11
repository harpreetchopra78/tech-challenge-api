# Start a mysql db for dev
`docker run -d -e MYSQL_ROOT_PASSWORD=password1234 -e MYSQL_DATABASE=app_db -p 3306:3306 --name app-mysql mysql:5`

# Docker build
`docker build -t tech-challenge-api .`

# Docker run
`docker run -d -p 5000:5000 -e  DB_HOST=host.docker.internal --name api-con tech-challenge-api`