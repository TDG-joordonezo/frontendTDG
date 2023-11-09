pipeline {
    agent any
    parameters {
        string(name: 'name_container', defaultValue: 'front-tdg', description: 'Nombre del contenedor')
        string(name: 'name_imagen', defaultValue: 'dtg_front-tdg', description: 'Nombre de la imagen')
        string(name: 'tag_imagen', defaultValue: 'latest', description: 'Etiqueta y/o versión de la imagen')
        string(name: 'puerto_imagen', defaultValue: '4200', description: 'Puerto de la imagen')
    }

    stages {
        stage('Detener/Limpiar') {
            steps {
                script {
                    def isDockerRunning = sh(returnStatus: true, script: 'sudo docker ps')
                    if (isDockerRunning == 0) {
                        sh """
                            sudo docker-compose down || true
                            sudo docker container rm -f ${name_container} || true
                            sudo docker image rm -f ${name_imagen}
                        """
                    } else {
                        echo 'No hay contenedores en ejecución'
                    }
                }
            }
        }

        stage('Construir/Iniciar Contenedor') {
            steps {
                sh """
                    sudo docker-compose up -d --build
                """
            }
        }

        stage('Verificación') {
            steps {
                sh """
                    sudo docker ps -a | grep ${name_container} || true
                """
            }
        }
    }
}
