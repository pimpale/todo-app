# todo-app Backend

This is a monolithic Java 11 service for the backend of todo-app. 
This service is designed to run on posix environments. 
It may work on Windows as well with extra setup, (see the Notes section)

### Setup Instructions

1. Ensure you have the required dependencies: 
    ```
    bash
    gradle
    sqlite3
    ```
2. Initialize the database. 
    ```
    $ sqlite3 todo-app.db
    ```

    This brings you into the sqlite interactive shell.
    In here, source the database by doing:

    ```
    sqlite> .read schema.sql
    sqlite> .quit
    ```

3. You will need an AWS key as well as a few other environment variables set.
In order to protect the security of these keys, they are kept in a seperate file called env-vars.sh not included here.
This file SHOULD NOT be committed, and is purposely gitignored.


### Run Instructions
1. Ensure you have thoroughly followed the setup instructions.
2. Execute the following commands to bring up the server.
    ```
    $ source env-vars.sh
    $ ./gradlew bootrun
    ```
3. To kill the server, press Ctrl-C on the window.


### Notes
As long as you have the bash program installed, it's possible to run on Windows.
However, Windows can often have problems with Gradle. 
To minimize the risk of this occuring, you should run the server in WSL.
If you recieve the folowing error: `./gradlew: 68: Syntax error: word unexpected (expecting "in")`, it means that git has automatically inserted CRLF line endings.
Make sure autocrlf is set to false in your git settings.
See https://stackoverflow.com/questions/10418975/how-to-change-line-ending-settings
