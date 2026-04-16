public with sharing class CustomTaskController {
    @AuraEnabled
    public static Id createNewTask(String subject) {
        Task newTask = new Task(Subject = subject);
        insert as user newTask;
        return newTask.Id;
    }

    @AuraEnabled
    public static Boolean updateTaskRecord(String recordId, String subject, String status) {
        if(recordId == null || subject == null || status == null) {
            return false;
        }

        Task t = new Task( Id = recordId, Subject = subject, Status = status );

        update as user t;

        return true;
    }
}