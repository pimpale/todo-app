# todo-app Backend

This is a monolithic Java 11 service for the backend of todo-app. 
This service is designed to run on posix environments. 

# Setup Instructions

1. If you're on Windows, you need to install WSL in order to run the server. 
    Once you're done, you should have Ubuntu 18 running on WSL.
    Linux and MacOS users can skip this step.
    We're following instructions from here: https://docs.microsoft.com/en-us/windows/wsl/install-win10

    Instructions:
    1. Open up an administrator powershell.
    2. Enter the following command to enable WSL:
        ```
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
        ```
        This enables WSL.
    3. To get better performance, you can optionally install WSL 2.
        It requires Windows 10 and virtualization support.
        Enter the following command to enable WSL 2:
        ```
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
        ```
    4. Install Ubuntu 18.04 from the Microsoft store. https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q?rtc=1&activetab=pivot:overviewtab
    5. Restart your computer.
    6. Open Ubuntu from the start menu.
    7. Enter in a Unix username and password.

2. The next few steps walk through the installation process of these dependencies:
    * JDK 11
    * Sqlite 3
    * Node 14
    * Yarn

    If running MacOS or a Linux distro other than Ubuntu, then the following instructions won't apply to you.
    Please install your dependencies independently, and then continue directly to step 5.

3. On Ubuntu (which you should have if you were following the Windows instructions), we can use apt to install basic dependencies. 

    Instructions:
    1. Preemptively update the system to avoid potential dependency version conflicts.
        Run this command in the shell:
        ```
        sudo apt update && sudo apt upgrade
        ```
    2. Now, we're going to install Java 11, Sqlite 3, and Git.
        ```
        sudo apt install openjdk-11-jdk sqlite3 git
        ```

4. On Ubuntu 18, Yarn and Node are severely out of date, and we will need to install them from another source.
    We're following instructions from https://computingforgeeks.com/install-node-js-14-on-ubuntu-debian-linux/

    Instructions:
    1. Download and run install script:
        ```
        curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
        ```
    2. Now, we have access to a more modern package that we can install:
        ```
        sudo apt -y install nodejs
        ```
    3. Verify the installation was successful:
        ```
        node  -v
        ```
       This should return something like `v14.0.0`, or a similar number beginning with `v14`. 
    4. Now, we have to install the [Yarn package manager]( https://yarnpkg.com/ ):
        ```
        curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
        sudo apt update && sudo apt install yarn
        ```
    5. Verify that Yarn is working:
        ```
        yarn --version
        ```
        This should return something like `1.22.10`, or a similar number.

5. It's now necessary to configure Git.

    Recently, GitHub has decided to [stop supporting password based authentication](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/). 
    This means you must use GitHub's personal access token system.
    You may already have set this up at a prior date, and if this is the case, you may skip to step 6.

    Instructions:
    1. Go to GitHub's token creation page: https://github.com/settings/tokens/new
        * You may need to log in.
    2. You should have entered a page with the title `New personal access token`.
    3. There should be a small textbox with the title `Note`. 
        Using `Note`, you can name your token anything you want, but I recommend naming it after the device you're using.
        This is because access tokens should not be shared across devices. 
        In case you lose your laptop, you can easily cancel your laptop's access token without causing a problem for other devices.
        Good naming example:
        ```
        govinds-laptop-1
        ```
    4. Now, we will select a scope for the token. 
        This limits what each token is able to do. 
        On the token creation page, you should see a tree of checkmarks under the header `Select scopes`.
        Select the top level scope `repo`. 
        This should automatically select the following keys:
        * repo
        * repo:status
        * repo_deployment
        * repo:invite
        * security_events

        Now, scroll down and hit `Generate token`.
    5. Copy the token generated. It will be highlighted in green.
        We'll need this token in later steps.
        It is important to save this token somewhere safe, since you can only see it once.
    6. Now, we'll set up our local git configuration to make use of our new access token.
        We'll need to edit files with a command line text editor.
        You may use vim, emacs, or any other editor you are familiar with, but in this guide we'll use [nano]( https://www.nano-editor.org/docs.php ).
    7. Run the following command to edit your git config:
        ```
        nano ~/.gitconfig
        ```
        Enter the following text:
        ```
        [user]
        	email = <your email>
        	name = <your GitHub username>
        [core]
        	pager = cat
        	autocrlf = false
        [credential]
        	helper = store
        ```
        Replace `<your email>` with the email you signed up for GitHub with. 

        Replace `<your GitHub username>` with your GitHub username.

        **Important note for Windows users**: 
        * Make sure autocrlf is set to false in your git settings. 
        * If you recieve the folowing error: `./gradlew: 68: Syntax error: word unexpected (expecting "in")`, it means that git has automatically inserted CRLF line endings.
        * Please ensure autocrlf is set to false, then re clone the repository to resolve this error.

    8. Run the following command to add your credentials:
        ```
        nano ~/.git-credentials
        ```
        Enter in the following text:
        ```
        https://<your GitHub username>:<your personal access token>@github.com
        ```
        Replace `<your GitHub username>` with your GitHub username.

        Replace `<your personal access token>` with the access token you saved earlier.
    9. In this step, we'll check our work.
        The following examples show what my files would look like if 
        * `example@example.com` was my email
        * `pimpale` was my GitHub username 
        * `0123456789abcdef0123456789abcdef` was my access token

        Check git config:
        ```
        cat ~/.gitconfig
        ```
        You should see this:
        ```
        [user]
        	email = example@example.com
        	name = pimpale
        [core]
        	pager = cat
        	autocrlf = false
        [credential]
        	helper = store
        ```

        Check git credentials:
        ```
        cat ~/.git-credentials
        ```
        You should see this:
        ```
        https://pimpale:0123456789abcdef0123456789abcdef@github.com
        ```

6. Now that our dependencies are installed, we need to git clone our repositories.

    Instructions:
    1. We're creating a workspace directory in order to reduce clutter. 
        This is optional, but recommended.
        ```
        cd ~
        mkdir workspace
        cd workspace
        ```
        The name and location of this folder is up to you.
        If you want to pick a different location, it should work equally well.
    2. Now, git clone the repositories:

        First, let's ensure you're in the right directory.
        To go into the workspace directory we created in the last step you can run:
        ```
        cd ~/workspace # or whatever else you chose
        ```
        If you chose your own directory, your command will be different.

        Which git repository to clone depends on which team you're on:
        * todo-app developers:
           ```
           git clone https://github.com/pimpale/todo-app
           ```
        * Innexgo Hours developers:
           ```
           git clone https://github.com/innexgo/school.hours.innexgo.com
           git clone https://github.com/innexgo/school.hours.innexgo.com-frontend
           ```

7. Configuring our environment variables (Backend Only):

    Because we integrate with other services, we have API keys, tokens, and passwords that can't be git pushed onto a public repository.
    In order to protect the security of these keys, they are kept in a separate file named `env-vars.sh` not included here.
    This file **SHOULD NOT** be committed, and is purposely included in the `.gitignore`.
    **If you push the file, let me know so that I can cancel the keys immediately.**
    We run the risk of our email being taken over by spammers otherwise.

    1. Obtain the file `env-vars.sh`. Ask me, and I will securely send it to you.
    2. Place `env-vars.sh` in the base directory of the backend app. 
        * For todo-app developers, this is in the [backend directory](./backend)
        * For Innexgo Hours developers, this is in the root directory of school.hours.innexgo.com

8. Setting up the database:

    You will need to execute this step every time the database schema changes.
    The database name depends on which team you're on:
    * todo-app developers:
       ```
       sqlite3 todo-app.db
       ```
    * Innexgo Hours developers:
       ```
       sqlite3 hours.db
       ```

    Entering the above command brings you into the sqlite interactive shell.
    For both teams, the setup is the same.
    Enter the following commands into the sqlite prompt:
    ```
    .read schema.sql
    .read mock-data.sql
    .quit
    ```

Congrats! You're done with setting up!

# Run Instructions
1. Ensure you have thoroughly followed the setup instructions.
2. Execute the following commands to bring up the server.
    ```
    source env-vars.sh
    ./gradlew bootrun
    ```
    When you run the server using `./gradlew`, the command will hang at 80% or 75% executing. 
    This is ok and not a bug, it happens because Gradle treats the server as a task to be 
    completed, and since the server needs to keep running, it doesn't complete.
    You'll know that the server has started when you see a large ascii `SPRING` logo.

    In order to use the website, you will need to start the frontend server as well.
    See [the frontend documentation](../frontend/README.md) for instructions
3. To kill the server, press Ctrl-C.
