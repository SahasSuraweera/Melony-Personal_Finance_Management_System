CREATE OR REPLACE TRIGGER trg_user_audit
AFTER INSERT OR UPDATE OR DELETE
ON UserInfo
FOR EACH ROW
DECLARE
    v_old_values VARCHAR2(2000);
    v_new_values VARCHAR2(2000);
    v_action_type VARCHAR2(15);
    v_user_id NUMBER;
    v_firstName VARCHAR2(50);
    v_lastName VARCHAR2(50);
    v_email VARCHAR2(100);
    v_occupation VARCHAR2(50);
    v_city VARCHAR2(50);
    v_phone VARCHAR2(20);
BEGIN

    IF INSERTING THEN
        v_action_type := 'INSERT';
    ELSIF DELETING THEN
        v_action_type := 'DELETE';
    ELSIF UPDATING THEN

        IF NVL(:OLD.isDeleted, 'N') = 'N' AND NVL(:NEW.isDeleted, 'N') = 'Y' THEN
            v_action_type := 'SOFT DELETE';
        ELSE
            v_action_type := 'UPDATE';
        END IF;
    END IF;

    v_user_id   := NVL(:NEW.user_id, :OLD.user_id);
    v_firstName := NVL(:NEW.firstName, :OLD.firstName);
    v_lastName  := NVL(:NEW.lastName, :OLD.lastName);
    v_email     := NVL(:NEW.email, :OLD.email);
    v_occupation:= NVL(:NEW.occupation, :OLD.occupation);
    v_city      := NVL(:NEW.city, :OLD.city);
    v_phone     := NVL(:NEW.phone, :OLD.phone);

    IF DELETING OR UPDATING THEN
        v_old_values := 
              'firstName=' || NVL(:OLD.firstName, 'NULL')
           || ', lastName=' || NVL(:OLD.lastName, 'NULL')
           || ', email=' || NVL(:OLD.email, 'NULL')
           || ', occupation=' || NVL(:OLD.occupation, 'NULL')
           || ', city=' || NVL(:OLD.city, 'NULL')
           || ', phone=' || NVL(:OLD.phone, 'NULL')
           || ', isDeleted=' || NVL(:OLD.isDeleted, 'NULL');
    END IF;

    IF INSERTING OR UPDATING THEN
        v_new_values := 
              'firstName=' || NVL(:NEW.firstName, 'NULL')
           || ', lastName=' || NVL(:NEW.lastName, 'NULL')
           || ', email=' || NVL(:NEW.email, 'NULL')
           || ', occupation=' || NVL(:NEW.occupation, 'NULL')
           || ', city=' || NVL(:NEW.city, 'NULL')
           || ', phone=' || NVL(:NEW.phone, 'NULL')
           || ', isDeleted=' || NVL(:NEW.isDeleted, 'NULL');
    END IF;

    INSERT INTO User_Audit_Log (
        user_id,
        firstName,
        lastName,
        email,
        occupation,
        city,
        phone,
        action_type,
        old_values,
        new_values
    )
    VALUES (
        v_user_id,
        v_firstName,
        v_lastName,
        v_email,
        v_occupation,
        v_city,
        v_phone,
        v_action_type,
        v_old_values,
        v_new_values
    );
END;
/