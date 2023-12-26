--  每发送一条消息时，需要执行此函数，以确保每条消息与双方都可以关联得上

CREATE DEFINER=`root`@`%` FUNCTION `isIncludeTableId`(userId VARCHAR(12), newTableName VARCHAR(30)) RETURNS tinyint(1)
    DETERMINISTIC
    COMMENT '需要两个参数，第一个参数是要判断的用户，第二个参数需要进行判断的数据表名，作用判断当前用户关联的数据表中是否存在当前数据表'
BEGIN
    DECLARE dataName VARCHAR(300);
    SELECT messageDataName INTO dataName FROM userinfo WHERE qq = userId;
    IF LOCATE(newTableName, dataName) = 0 THEN
        UPDATE userinfo SET messageDataName = CONCAT(dataName, newTableName, '-') WHERE qq = userId;
    END IF;
    RETURN TRUE;
END