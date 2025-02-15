-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_userListId_fkey`;

-- DropIndex
DROP INDEX `Task_userListId_fkey` ON `task`;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_userListId_fkey` FOREIGN KEY (`userListId`) REFERENCES `UserList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
