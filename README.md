3. HABIDEEN Ibrahim
       IP: 196.27.128.111
       username – habideendev
       Pwd: H@b1d33n321
       Hard drive: 60 GB
       RAM: 6GB
       
       
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '@k!n20ricH';
_Q05s4g8sjbGIKC1lCzM5udE1R_


phpmyadmin: Bra!mo@2143
tomatoes_ut5zql: TomCom@2!4.3




DROP USER IF EXISTS 'tomatoes_ut5zql'@'localhost';

CREATE USER 'tomatoes_ut5zql'@'%' IDENTIFIED WITH mysql_native_password BY 'TomCom@2!4.3';

GRANT ALL PRIVILEGES ON tomatoes.* TO 'tomatoes_ut5zql'@'localhost';

ALTER USER 'tomatoes_ut5zql'@'%' REQUIRE NONE;

FLUSH PRIVILEGES;

EXIT;




mysql -h 91.204.209.2 -u tomatoes -p




DROP USER IF EXISTS 'toql'@'localhost';

CREATE USER 'tomatoes_ut5zql'@'%' IDENTIFIED WITH mysql_native_password BY 'Txxxxx.3';

GRANT ALL PRIVILEGES ON tomatoes.* TO 'toql'@'localhost';

FLUSH PRIVILEGES;

EXIT;





DROP DATABASE IF EXISTS phpmyadmin;
DROP USER IF EXISTS 'phpmyadmin'@'localhost';

CREATE DATABASE phpmyadmin;

CREATE USER phpmyadmin@'localhost' IDENTIFIED WITH mysql_native_password BY 'Bra!mo@2143';

GRANT ALL PRIVILEGES ON phpmyadmin.* TO phpmyadmin@'localhost';

FLUSH PRIVILEGES;

EXIT;

