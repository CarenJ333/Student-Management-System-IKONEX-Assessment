-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: ikonex_academy
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('Exam','CA','Quiz','Assignment') NOT NULL,
  `stream_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `max_score` decimal(5,2) NOT NULL DEFAULT '100.00',
  `weight` decimal(5,2) NOT NULL DEFAULT '100.00',
  `academic_year` varchar(9) NOT NULL,
  `term` enum('Term 1','Term 2','Term 3') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `stream_id` (`stream_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`stream_id`) REFERENCES `class_streams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (1,'End of Term Exam','Exam',1,1,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:40:03'),(2,'End of Term Exam','Exam',1,2,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:41:08'),(3,'End of Term Exam','Exam',1,7,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:41:42'),(4,'End of Term Exam','Exam',1,11,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:42:02'),(5,'End of Term Exam','Exam',1,8,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:42:31'),(7,'End of Term Exam','Exam',1,9,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:43:19'),(8,'End of Term Exam','Exam',1,6,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:44:15'),(9,'End of Term Exam','Exam',1,10,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:44:46'),(10,'End of Term Exam','Exam',1,5,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:45:16'),(11,'End of Term Exam','Exam',1,4,70.00,100.00,'2024/2025','Term 1','2026-06-05 13:45:41'),(12,'End of Term Exam','Exam',1,12,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:03:11'),(13,'Continuous Assessment ','CA',1,1,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:18:28'),(14,'Continuous Assessment','CA',1,2,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:21:32'),(15,'Continuous Assessment','CA',1,6,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:22:05'),(16,'Continuous Assessment','CA',1,12,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:22:37'),(17,'Continuous Assessment','CA',1,4,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:23:24'),(18,'Continuous Assessment','CA',1,5,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:24:20'),(19,'Continuous Assessment','CA',1,10,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:24:53'),(20,'Continuous Assessment','CA',1,9,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:25:25'),(21,'Continuous Assessment','CA',1,8,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:26:14'),(22,'Continuous Assessment','CA',1,11,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:26:58'),(23,'Continuous Assessment','CA',1,7,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:27:40'),(24,'End of Term Exam','Exam',2,1,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:46:07'),(25,'End of Term Exam','Exam',2,2,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:47:33'),(26,'End of Term Exam','Exam',2,6,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:48:03'),(27,'End of Term Exam','Exam',2,12,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:48:33'),(28,'End of Term Exam','Exam',2,4,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:49:03'),(29,'End of Term Exam','Exam',2,5,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:49:30'),(30,'End of Term Exam','Exam',2,10,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:49:56'),(31,'End of Term Exam','Exam',2,9,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:51:02'),(32,'End of Term Exam','Exam',2,8,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:51:51'),(33,'End of Term Exam','Exam',2,11,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:52:25'),(34,'End of Term Exam','Exam',2,7,70.00,100.00,'2024/2025','Term 1','2026-06-05 14:52:49'),(35,'Continuous Assessment','CA',2,1,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:58:10'),(36,'Continuous Assessment','CA',2,2,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:58:41'),(37,'Continuous Assessment','CA',2,12,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:59:14'),(38,'Continuous Assessment','CA',2,4,30.00,100.00,'2024/2025','Term 1','2026-06-05 14:59:52'),(39,'Continuous Assessment','CA',2,5,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:00:32'),(40,'Continuous Assessment','CA',2,10,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:01:22'),(41,'Continuous Assesment','CA',2,9,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:01:56'),(42,'Continuous Assessment','CA',2,8,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:02:42'),(43,'Continuous Assessment','CA',2,11,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:03:18'),(44,'Continuous Assessment','CA',2,7,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:03:50'),(45,'End of Term Exam','Exam',3,1,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:27:56'),(46,'End of Term Exam','Exam',3,2,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:29:16'),(47,'End of Term Exam','Exam',3,6,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:30:02'),(48,'End of Term Exam','Exam',3,12,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:31:09'),(49,'End of Term Exam','Exam',3,4,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:32:30'),(50,'End of Term Exam','Exam',3,5,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:33:19'),(51,'End of Term Exam','Exam',3,10,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:34:02'),(52,'End of Term Exam','Exam',3,9,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:34:35'),(53,'End of Term Exam','Exam',3,8,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:35:50'),(54,'End of Term Exam','Exam',3,11,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:36:23'),(55,'End of Term Exam','Exam',3,7,70.00,100.00,'2024/2025','Term 1','2026-06-05 15:36:56'),(56,'Continuous Assessments','CA',3,1,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:38:06'),(57,'Continuous Assessments','CA',3,2,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:38:45'),(58,'Continuous Assessments','CA',3,6,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:39:22'),(59,'Continuous Assessments','CA',3,12,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:40:13'),(60,'Continuous Assessments','CA',3,4,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:40:56'),(61,'Continuous Assessments','CA',3,5,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:41:29'),(62,'Continuous Assessments','CA',3,10,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:42:05'),(63,'Continuous Assessments','CA',3,9,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:42:41'),(64,'Continuous Assessments','CA',3,8,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:43:13'),(65,'Continuous Assessments','CA',3,11,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:44:39'),(66,'Continuous Assessments','CA',3,7,30.00,100.00,'2024/2025','Term 1','2026-06-05 15:45:17'),(67,'Continuous Assessment','CA',2,6,30.00,100.00,'2024/2025','Term 1','2026-06-05 21:01:31');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_streams`
--

DROP TABLE IF EXISTS `class_streams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_streams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `form_level` int NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_streams`
--

LOCK TABLES `class_streams` WRITE;
/*!40000 ALTER TABLE `class_streams` DISABLE KEYS */;
INSERT INTO `class_streams` VALUES (1,'Form 1A',1,'2024/2025','2026-06-04 15:21:19','2026-06-04 15:21:19'),(2,'Form 1B',1,'2024/2025','2026-06-04 15:21:19','2026-06-04 15:21:19'),(3,'Form 2A',2,'2024/2025','2026-06-04 15:21:19','2026-06-04 15:21:19');
/*!40000 ALTER TABLE `class_streams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grading_scales`
--

DROP TABLE IF EXISTS `grading_scales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grading_scales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grade` varchar(5) NOT NULL,
  `min_score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `label` varchar(50) NOT NULL,
  `points` decimal(3,1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grading_scales`
--

LOCK TABLES `grading_scales` WRITE;
/*!40000 ALTER TABLE `grading_scales` DISABLE KEYS */;
INSERT INTO `grading_scales` VALUES (1,'A',75.00,100.00,'Distinction',4.0),(2,'B',65.00,74.99,'Merit',3.0),(3,'C',55.00,64.99,'Credit',2.0),(4,'D',45.00,54.99,'Pass',1.0),(5,'E',35.00,44.99,'Near Miss',0.5),(6,'U',0.00,34.99,'Fail',0.0);
/*!40000 ALTER TABLE `grading_scales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `assessment_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_assessment` (`student_id`,`assessment_id`),
  KEY `assessment_id` (`assessment_id`),
  CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_score` CHECK ((`score` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=396 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
INSERT INTO `scores` VALUES (1,3,1,62.00,NULL,'2026-06-05 13:48:33','2026-06-05 15:09:59'),(2,4,1,65.00,NULL,'2026-06-05 13:48:33','2026-06-05 15:09:59'),(3,5,1,60.00,NULL,'2026-06-05 13:48:33','2026-06-05 15:09:59'),(4,3,2,60.00,NULL,'2026-06-05 13:49:52','2026-06-05 15:10:35'),(5,4,2,58.00,NULL,'2026-06-05 13:49:52','2026-06-05 15:10:35'),(6,5,2,58.00,NULL,'2026-06-05 13:49:52','2026-06-05 15:10:35'),(7,3,8,58.00,NULL,'2026-06-05 13:50:21','2026-06-05 15:13:02'),(8,4,8,65.00,NULL,'2026-06-05 13:50:21','2026-06-05 15:13:02'),(9,5,8,52.00,NULL,'2026-06-05 13:50:21','2026-06-05 15:13:02'),(10,5,11,62.00,NULL,'2026-06-05 13:59:09','2026-06-05 15:14:14'),(11,3,3,62.00,NULL,'2026-06-05 14:00:07','2026-06-05 14:00:07'),(12,4,3,66.00,NULL,'2026-06-05 14:00:07','2026-06-05 15:11:16'),(13,5,3,64.00,NULL,'2026-06-05 14:00:07','2026-06-05 15:11:16'),(14,3,5,60.00,NULL,'2026-06-05 14:00:33','2026-06-05 15:12:12'),(15,4,5,64.00,NULL,'2026-06-05 14:00:33','2026-06-05 15:12:12'),(16,5,5,62.00,NULL,'2026-06-05 14:00:33','2026-06-05 15:12:12'),(17,4,10,60.00,NULL,'2026-06-05 14:00:57','2026-06-05 15:13:35'),(18,4,9,66.00,NULL,'2026-06-05 14:01:27','2026-06-05 15:13:20'),(19,5,9,65.00,NULL,'2026-06-05 14:01:27','2026-06-05 17:02:12'),(20,3,7,68.00,NULL,'2026-06-05 14:01:39','2026-06-05 15:12:26'),(21,3,4,66.00,NULL,'2026-06-05 14:02:07','2026-06-05 15:11:46'),(22,4,4,68.00,NULL,'2026-06-05 14:02:07','2026-06-05 15:11:46'),(25,5,12,50.00,NULL,'2026-06-05 14:03:32','2026-06-05 15:14:29'),(28,3,13,22.00,NULL,'2026-06-05 14:41:07','2026-06-05 14:41:07'),(29,4,13,25.00,NULL,'2026-06-05 14:41:07','2026-06-05 14:41:07'),(30,5,13,28.00,NULL,'2026-06-05 14:41:07','2026-06-05 14:41:07'),(55,2,24,58.00,NULL,'2026-06-05 15:16:26','2026-06-05 15:16:26'),(56,6,24,52.00,NULL,'2026-06-05 15:16:26','2026-06-05 15:16:26'),(57,7,24,68.00,NULL,'2026-06-05 15:16:26','2026-06-05 15:16:26'),(58,2,25,65.00,NULL,'2026-06-05 15:16:50','2026-06-05 15:16:50'),(59,6,25,62.00,NULL,'2026-06-05 15:16:50','2026-06-05 15:16:50'),(60,7,25,53.00,NULL,'2026-06-05 15:16:50','2026-06-05 15:16:50'),(61,2,26,60.00,NULL,'2026-06-05 15:17:11','2026-06-05 15:17:11'),(62,6,26,66.00,NULL,'2026-06-05 15:17:11','2026-06-05 15:17:11'),(63,7,26,62.00,NULL,'2026-06-05 15:17:11','2026-06-05 15:17:11'),(64,2,34,60.00,NULL,'2026-06-05 15:17:36','2026-06-05 15:17:36'),(65,6,34,64.00,NULL,'2026-06-05 15:17:36','2026-06-05 15:17:36'),(66,7,34,66.00,NULL,'2026-06-05 15:17:36','2026-06-05 15:17:36'),(67,2,32,58.00,NULL,'2026-06-05 15:17:56','2026-06-05 15:17:56'),(68,6,32,54.00,NULL,'2026-06-05 15:17:56','2026-06-05 15:17:56'),(69,7,32,55.00,NULL,'2026-06-05 15:17:56','2026-06-05 15:17:56'),(70,7,29,60.00,NULL,'2026-06-05 15:18:25','2026-06-05 15:18:25'),(71,2,28,67.00,NULL,'2026-06-05 15:19:27','2026-06-05 15:19:27'),(72,6,28,62.00,NULL,'2026-06-05 15:19:28','2026-06-05 15:19:28'),(73,7,30,69.00,NULL,'2026-06-05 15:21:32','2026-06-05 15:21:32'),(74,2,30,68.00,NULL,'2026-06-05 15:21:48','2026-06-05 15:21:48'),(75,6,30,68.00,NULL,'2026-06-05 15:21:48','2026-06-05 15:21:48'),(77,7,33,64.00,NULL,'2026-06-05 15:22:10','2026-06-05 15:22:10'),(78,2,27,66.00,NULL,'2026-06-05 15:22:25','2026-06-05 15:22:25'),(79,6,27,65.00,NULL,'2026-06-05 15:22:25','2026-06-05 15:22:25'),(80,8,45,50.00,NULL,'2026-06-05 16:24:24','2026-06-05 16:24:24'),(81,9,45,53.00,NULL,'2026-06-05 16:24:24','2026-06-05 16:24:24'),(82,10,45,52.00,NULL,'2026-06-05 16:24:24','2026-06-05 16:24:24'),(83,11,45,51.00,NULL,'2026-06-05 16:24:24','2026-06-05 16:24:24'),(84,8,46,61.00,NULL,'2026-06-05 16:25:28','2026-06-05 16:25:28'),(85,9,46,65.00,NULL,'2026-06-05 16:25:28','2026-06-05 16:25:28'),(86,10,46,60.00,NULL,'2026-06-05 16:25:28','2026-06-05 16:25:28'),(87,11,46,60.00,NULL,'2026-06-05 16:25:28','2026-06-05 16:25:28'),(88,8,47,57.00,NULL,'2026-06-05 16:26:36','2026-06-05 16:26:36'),(89,9,47,55.00,NULL,'2026-06-05 16:26:36','2026-06-05 16:26:36'),(90,10,47,55.00,NULL,'2026-06-05 16:26:36','2026-06-05 16:26:36'),(91,11,47,56.00,NULL,'2026-06-05 16:26:36','2026-06-05 16:26:36'),(92,8,55,42.00,NULL,'2026-06-05 16:27:39','2026-06-05 16:27:39'),(93,9,55,35.00,NULL,'2026-06-05 16:27:39','2026-06-05 16:27:39'),(94,10,55,48.00,NULL,'2026-06-05 16:27:39','2026-06-05 16:27:39'),(95,11,55,33.00,NULL,'2026-06-05 16:27:39','2026-06-05 16:27:39'),(96,8,53,44.00,NULL,'2026-06-05 16:28:19','2026-06-05 16:28:19'),(97,9,53,20.00,NULL,'2026-06-05 16:28:19','2026-06-06 14:44:12'),(98,10,53,45.00,NULL,'2026-06-05 16:28:19','2026-06-05 16:28:19'),(99,11,53,43.00,NULL,'2026-06-05 16:28:19','2026-06-05 16:28:19'),(100,10,49,40.00,NULL,'2026-06-05 16:28:57','2026-06-05 16:28:57'),(101,10,51,56.00,NULL,'2026-06-05 16:29:30','2026-06-05 16:29:30'),(102,10,54,58.00,NULL,'2026-06-05 16:30:13','2026-06-05 16:30:13'),(104,11,52,40.00,NULL,'2026-06-05 16:30:44','2026-06-05 16:30:44'),(105,8,50,56.00,NULL,'2026-06-05 16:31:14','2026-06-05 16:31:14'),(106,8,54,56.00,NULL,'2026-06-05 16:31:31','2026-06-05 16:31:31'),(109,9,50,60.00,NULL,'2026-06-05 16:32:03','2026-06-05 16:32:03'),(110,9,51,50.00,NULL,'2026-06-05 16:32:20','2026-06-05 16:32:20'),(112,9,48,56.00,NULL,'2026-06-05 16:32:56','2026-06-05 16:32:56'),(113,11,48,60.00,NULL,'2026-06-05 16:32:56','2026-06-05 16:32:56'),(114,8,56,23.00,NULL,'2026-06-05 16:35:18','2026-06-05 16:35:18'),(115,9,56,18.00,NULL,'2026-06-05 16:35:18','2026-06-05 16:35:18'),(116,10,56,20.00,NULL,'2026-06-05 16:35:18','2026-06-05 16:35:18'),(117,11,56,20.00,NULL,'2026-06-05 16:35:18','2026-06-05 16:35:18'),(118,8,57,29.00,NULL,'2026-06-05 16:35:41','2026-06-05 16:35:41'),(119,9,57,27.00,NULL,'2026-06-05 16:35:41','2026-06-05 16:35:41'),(120,10,57,28.00,NULL,'2026-06-05 16:35:41','2026-06-05 16:35:41'),(121,11,57,29.00,NULL,'2026-06-05 16:35:41','2026-06-05 16:35:41'),(122,8,58,27.00,NULL,'2026-06-05 16:35:59','2026-06-05 16:35:59'),(123,9,58,29.00,NULL,'2026-06-05 16:35:59','2026-06-05 16:35:59'),(124,10,58,26.00,NULL,'2026-06-05 16:35:59','2026-06-05 16:35:59'),(125,11,58,26.00,NULL,'2026-06-05 16:35:59','2026-06-05 16:35:59'),(127,9,59,23.00,NULL,'2026-06-05 16:36:27','2026-06-05 16:36:27'),(129,11,59,25.00,NULL,'2026-06-05 16:36:27','2026-06-05 16:36:27'),(130,10,60,27.00,NULL,'2026-06-05 16:37:09','2026-06-05 16:37:09'),(131,8,61,23.00,NULL,'2026-06-05 16:37:45','2026-06-05 16:37:45'),(132,9,61,26.00,NULL,'2026-06-05 16:37:45','2026-06-05 16:37:45'),(133,9,62,25.00,NULL,'2026-06-05 16:38:19','2026-06-05 16:38:19'),(134,10,62,20.00,NULL,'2026-06-05 16:38:19','2026-06-05 16:38:19'),(135,11,62,24.00,NULL,'2026-06-05 16:38:19','2026-06-05 16:38:19'),(136,8,63,18.00,NULL,'2026-06-05 16:39:01','2026-06-05 16:39:01'),(137,11,63,16.00,NULL,'2026-06-05 16:39:01','2026-06-05 16:39:01'),(138,8,64,12.00,NULL,'2026-06-05 16:39:55','2026-06-05 16:39:55'),(139,9,64,11.00,NULL,'2026-06-05 16:39:55','2026-06-05 16:39:55'),(140,10,64,13.00,NULL,'2026-06-05 16:39:55','2026-06-05 16:39:55'),(141,11,64,10.00,NULL,'2026-06-05 16:39:55','2026-06-05 16:39:55'),(142,8,65,28.00,NULL,'2026-06-05 16:40:27','2026-06-05 16:40:27'),(143,10,65,28.00,NULL,'2026-06-05 16:40:27','2026-06-05 16:40:27'),(144,8,66,10.00,NULL,'2026-06-05 16:41:05','2026-06-05 16:41:05'),(145,9,66,16.00,NULL,'2026-06-05 16:41:05','2026-06-05 16:41:05'),(146,10,66,15.00,NULL,'2026-06-05 16:41:05','2026-06-05 16:41:05'),(147,11,66,14.00,NULL,'2026-06-05 16:41:05','2026-06-05 16:41:05'),(151,12,1,42.00,NULL,'2026-06-05 16:57:42','2026-06-06 09:49:15'),(155,12,2,55.00,NULL,'2026-06-05 16:58:04','2026-06-05 16:58:04'),(159,12,3,63.00,NULL,'2026-06-05 16:58:46','2026-06-05 16:58:46'),(163,12,8,60.00,NULL,'2026-06-05 16:59:15','2026-06-05 16:59:15'),(167,12,5,63.00,NULL,'2026-06-05 17:00:12','2026-06-05 17:00:12'),(168,3,10,65.00,NULL,'2026-06-05 17:01:08','2026-06-05 17:01:08'),(170,12,10,63.00,NULL,'2026-06-05 17:01:08','2026-06-05 17:01:08'),(175,12,9,68.00,NULL,'2026-06-05 17:02:12','2026-06-05 17:02:12'),(178,12,4,62.00,NULL,'2026-06-05 17:02:39','2026-06-05 17:02:39'),(182,12,13,15.00,NULL,'2026-06-05 17:03:19','2026-06-06 09:49:01'),(183,3,14,27.00,NULL,'2026-06-05 17:03:51','2026-06-05 17:03:51'),(184,4,14,29.00,NULL,'2026-06-05 17:03:51','2026-06-05 17:03:51'),(185,5,14,25.00,NULL,'2026-06-05 17:03:51','2026-06-05 17:03:51'),(186,12,14,28.00,NULL,'2026-06-05 17:03:51','2026-06-05 17:03:51'),(187,3,15,28.00,NULL,'2026-06-05 17:04:24','2026-06-05 17:04:24'),(188,4,15,28.00,NULL,'2026-06-05 17:04:24','2026-06-05 17:04:24'),(189,5,15,20.00,NULL,'2026-06-05 17:04:24','2026-06-05 17:04:24'),(190,12,15,22.00,NULL,'2026-06-05 17:04:24','2026-06-05 17:04:24'),(191,3,23,15.00,NULL,'2026-06-05 17:04:54','2026-06-05 17:04:54'),(192,4,23,18.00,NULL,'2026-06-05 17:04:54','2026-06-05 17:04:54'),(193,5,23,27.00,NULL,'2026-06-05 17:04:54','2026-06-05 17:04:54'),(194,12,23,20.00,NULL,'2026-06-05 17:04:54','2026-06-05 17:04:54'),(195,3,21,15.00,NULL,'2026-06-05 17:05:15','2026-06-05 17:05:15'),(196,4,21,13.00,NULL,'2026-06-05 17:05:15','2026-06-05 17:05:15'),(197,5,21,21.00,NULL,'2026-06-05 17:05:15','2026-06-05 17:05:15'),(198,12,21,18.00,NULL,'2026-06-05 17:05:15','2026-06-05 17:05:15'),(199,3,18,22.00,NULL,'2026-06-05 17:06:00','2026-06-05 17:06:00'),(200,4,18,21.00,NULL,'2026-06-05 17:06:00','2026-06-05 17:06:00'),(201,12,18,20.00,NULL,'2026-06-05 17:06:00','2026-06-05 17:06:00'),(202,5,17,25.00,NULL,'2026-06-05 17:06:19','2026-06-05 17:06:19'),(203,4,19,28.00,NULL,'2026-06-05 17:07:30','2026-06-05 17:07:30'),(204,5,19,26.00,NULL,'2026-06-05 17:07:30','2026-06-05 17:07:30'),(205,12,19,27.00,NULL,'2026-06-05 17:07:30','2026-06-05 17:07:30'),(206,3,20,28.00,NULL,'2026-06-05 17:07:47','2026-06-05 17:07:47'),(207,3,22,29.00,NULL,'2026-06-05 17:08:44','2026-06-05 17:08:44'),(208,4,22,28.00,NULL,'2026-06-05 17:08:44','2026-06-05 17:08:44'),(209,12,22,27.00,NULL,'2026-06-05 17:08:44','2026-06-05 17:08:44'),(210,5,16,26.00,NULL,'2026-06-05 17:09:08','2026-06-05 17:09:08'),(214,13,24,62.00,NULL,'2026-06-05 17:11:29','2026-06-05 17:11:29'),(218,13,25,60.00,NULL,'2026-06-05 17:11:52','2026-06-05 17:11:52'),(222,13,26,58.00,NULL,'2026-06-05 17:12:18','2026-06-05 17:12:18'),(226,13,34,65.00,NULL,'2026-06-05 17:12:54','2026-06-05 17:12:54'),(230,13,32,50.00,NULL,'2026-06-05 17:13:06','2026-06-05 17:13:06'),(232,13,29,55.00,NULL,'2026-06-05 17:13:49','2026-06-05 17:13:49'),(236,13,30,60.00,NULL,'2026-06-05 17:14:10','2026-06-05 17:14:10'),(238,13,33,66.00,NULL,'2026-06-05 17:14:29','2026-06-05 17:14:29'),(249,2,35,27.00,NULL,'2026-06-05 20:59:02','2026-06-05 20:59:02'),(250,6,35,29.00,NULL,'2026-06-05 20:59:02','2026-06-05 20:59:02'),(251,7,35,28.00,NULL,'2026-06-05 20:59:02','2026-06-05 20:59:02'),(252,13,35,26.00,NULL,'2026-06-05 20:59:02','2026-06-05 20:59:02'),(253,2,36,29.00,NULL,'2026-06-05 20:59:22','2026-06-05 20:59:22'),(254,6,36,17.00,NULL,'2026-06-05 20:59:22','2026-06-05 20:59:22'),(255,7,36,23.00,NULL,'2026-06-05 20:59:22','2026-06-05 20:59:22'),(256,13,36,27.00,NULL,'2026-06-05 20:59:22','2026-06-05 20:59:22'),(257,2,67,13.00,NULL,'2026-06-05 21:02:01','2026-06-05 21:02:01'),(258,6,67,22.00,NULL,'2026-06-05 21:02:01','2026-06-05 21:02:01'),(259,7,67,18.00,NULL,'2026-06-05 21:02:01','2026-06-05 21:02:01'),(260,13,67,15.00,NULL,'2026-06-05 21:02:01','2026-06-05 21:02:01'),(261,2,44,25.00,NULL,'2026-06-05 21:02:30','2026-06-05 21:02:30'),(262,6,44,18.00,NULL,'2026-06-05 21:02:30','2026-06-05 21:02:30'),(263,7,44,13.00,NULL,'2026-06-05 21:02:30','2026-06-05 21:02:30'),(264,13,44,22.00,NULL,'2026-06-05 21:02:30','2026-06-05 21:02:30'),(265,2,42,26.00,NULL,'2026-06-05 21:02:50','2026-06-05 21:02:50'),(266,6,42,20.00,NULL,'2026-06-05 21:02:50','2026-06-05 21:02:50'),(267,7,42,22.00,NULL,'2026-06-05 21:02:50','2026-06-05 21:02:50'),(268,13,42,14.00,NULL,'2026-06-05 21:02:50','2026-06-05 21:02:50'),(269,7,39,24.00,NULL,'2026-06-05 21:03:30','2026-06-05 21:03:30'),(270,13,39,18.00,NULL,'2026-06-05 21:03:30','2026-06-05 21:03:30'),(271,2,38,22.00,NULL,'2026-06-05 21:03:53','2026-06-05 21:03:53'),(272,6,38,25.00,NULL,'2026-06-05 21:03:53','2026-06-05 21:03:53'),(273,2,40,28.00,NULL,'2026-06-05 21:04:17','2026-06-05 21:04:17'),(274,6,40,29.00,NULL,'2026-06-05 21:04:17','2026-06-05 21:04:17'),(275,7,40,24.00,NULL,'2026-06-05 21:04:17','2026-06-05 21:04:17'),(276,13,40,26.00,NULL,'2026-06-05 21:04:17','2026-06-05 21:04:17'),(278,7,43,20.00,NULL,'2026-06-05 21:04:43','2026-06-05 21:04:43'),(280,13,43,15.00,NULL,'2026-06-05 21:05:28','2026-06-05 21:05:28'),(281,2,37,21.00,NULL,'2026-06-05 21:05:56','2026-06-05 21:05:56'),(282,6,37,22.00,NULL,'2026-06-05 21:05:56','2026-06-05 21:05:56'),(296,8,52,30.00,NULL,'2026-06-06 10:14:35','2026-06-06 10:14:35'),(300,11,51,45.00,NULL,'2026-06-06 10:16:37','2026-06-06 10:16:37');
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stream_subjects`
--

DROP TABLE IF EXISTS `stream_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stream_subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stream_id` int NOT NULL,
  `subject_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stream_subject` (`stream_id`,`subject_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `stream_subjects_ibfk_1` FOREIGN KEY (`stream_id`) REFERENCES `class_streams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stream_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stream_subjects`
--

LOCK TABLES `stream_subjects` WRITE;
/*!40000 ALTER TABLE `stream_subjects` DISABLE KEYS */;
INSERT INTO `stream_subjects` VALUES (1,1,1),(2,1,2),(4,1,4),(5,1,5),(22,1,6),(18,1,7),(20,1,8),(17,1,9),(21,1,10),(19,1,11),(23,1,12),(6,2,1),(7,2,2),(9,2,4),(10,2,5),(30,2,6),(34,2,7),(32,2,8),(36,2,9),(31,2,10),(33,2,11),(35,2,12),(11,3,1),(12,3,2),(14,3,4),(15,3,5),(29,3,6),(25,3,7),(27,3,8),(16,3,9),(28,3,10),(26,3,11),(24,3,12);
/*!40000 ALTER TABLE `stream_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_number` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `stream_id` int NOT NULL,
  `enrollment_date` date DEFAULT (curdate()),
  `status` enum('Active','Inactive','Transferred') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_number` (`student_number`),
  KEY `stream_id` (`stream_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`stream_id`) REFERENCES `class_streams` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (2,'1006','Tinashe','Moyoo','2009-01-09','Male','tinashemoyo@gmail.com','0712321345','Buruburu, Phase 1, Nairobi',2,NULL,'Active','2026-06-04 17:06:45','2026-06-05 13:25:42'),(3,'1001','Otieno','Odhiambo','2009-06-10','Male','otieno.odhiambo@gmail.com','0743111111','Oginga Rd, Kisumu',1,NULL,'Active','2026-06-04 21:01:45','2026-06-04 21:01:45'),(4,'1002','Mary ','Mwangi','2009-12-30','Female','marymwangi@gmail.com','0765234908','Langata',1,NULL,'Active','2026-06-05 12:10:09','2026-06-05 13:23:01'),(5,'1003','Stanley','Ruto','2010-12-04','Male','Stanley.ruto@gmail.com','0788543678','Ngara, Nairobi',1,NULL,'Active','2026-06-05 13:00:25','2026-06-05 13:00:25'),(6,'1004','Olivia ','Mutua','2010-06-03','Female','olivia.mutua@gmail.com','0712323453','Machakos',2,NULL,'Active','2026-06-05 13:05:03','2026-06-05 13:05:03'),(7,'1005','Ava','Chebet','2010-02-19','Female','ava.chebet@gmail.com','0768454372','Ngong Rd',2,NULL,'Active','2026-06-05 13:07:12','2026-06-05 13:22:40'),(8,'2001','Emily','Kimani','2007-09-21','Female','emily.kimani@gmail.com','0786454673','Kilimani',3,NULL,'Active','2026-06-05 13:31:54','2026-06-05 13:31:54'),(9,'2002','Michael','Otieno','2007-07-04','Male','michael.otieno@gmail.com','0755345232','Westlands',3,NULL,'Active','2026-06-05 13:33:40','2026-06-05 13:33:40'),(10,'2003','Chloe','Evans','2007-06-12','Female','chloe.evans@gmail.com','0756239877','westlands',3,NULL,'Active','2026-06-05 13:35:05','2026-06-05 13:35:05'),(11,'2004','Benjamin','Simiyu','2007-10-10','Male','benjamin.simiyu@gmail.com','0743546756','Parklands',3,NULL,'Active','2026-06-05 13:36:27','2026-06-05 13:36:27'),(12,'1007','Lucy','Green','2009-07-06','Female','emily.green@gmail.com','0768345654','Thika rd',1,NULL,'Active','2026-06-05 16:45:21','2026-06-05 16:45:21'),(13,'1008','Matthew ','Maina','2009-08-03','Male','matthew.maina@gmail.com','0768543234','Lavington',2,NULL,'Active','2026-06-05 16:47:53','2026-06-05 16:47:53');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Mathematics','MATH178','compulsory','2026-06-04 15:21:19','2026-06-05 13:15:23'),(2,'English Language','ENG108','compulsory','2026-06-04 15:21:19','2026-06-05 13:15:41'),(4,'History','HIST187','optional','2026-06-04 15:21:19','2026-06-05 13:14:17'),(5,'Geography','GEO166','optional','2026-06-04 15:21:19','2026-06-05 13:15:33'),(6,'Kiswahili','Kis124','compulsory','2026-06-04 21:06:23','2026-06-05 13:11:22'),(7,'Biology','BIO111','compulsory','2026-06-05 13:13:20','2026-06-05 13:13:20'),(8,'Chemistry','che115','compulsory','2026-06-05 13:13:45','2026-06-05 13:13:45'),(9,'Physics','PHY444','optional','2026-06-05 13:15:11','2026-06-05 13:15:11'),(10,'CRE','CRE435','optional','2026-06-05 13:16:16','2026-06-05 13:16:16'),(11,'Business Studies','BUS245','optional','2026-06-05 13:17:11','2026-06-05 13:17:11'),(12,'Agriculture','AGR234','optional','2026-06-05 13:57:20','2026-06-05 13:57:20');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-07  1:46:16
