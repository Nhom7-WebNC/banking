-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: sql12.freemysqlhosting.net
-- Generation Time: Jun 13, 2020 at 04:28 PM
-- Server version: 5.5.62-0ubuntu0.14.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.3

SET SQL_MODE
= "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT
= 0;
START TRANSACTION;
SET time_zone
= "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql12345881`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account`
(
  `id` int
(11) NOT NULL,
  `checking_account_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int
(11) NOT NULL,
  `checking_account_amount` int
(11) NOT NULL,
  `saving_account_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `saving_account_amount` int
(11) NOT NULL,
  `otp_code` varchar
(11) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` date NOT NULL,
  `updated_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`
id`,
`checking_account_number
`, `user_id`, `checking_account_amount`, `saving_account_number`, `saving_account_amount`, `otp_code`, `created_at`, `updated_at`) VALUES
(1, '3000001', 1, 3126171, '', 0, '4248', '0000-00-00', '0000-00-00'),
(2, '230500002', 2, 300000, '', 0, '5282', '2020-06-07', '0000-00-00');

-- --------------------------------------------------------

--
-- Table structure for table `associate_bank`
--

CREATE TABLE `associate_bank`
(
  `id` int
(11) NOT NULL,
  `code` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `encryption_type` varchar
(20) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receiver_list`
--

CREATE TABLE `receiver_list`
(
  `id` int
(11) NOT NULL,
  `name` varchar
(20) COLLATE utf8_unicode_ci NOT NULL,
  `account_number` int
(20) NOT NULL,
  `bank_code` varchar
(10) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_history`
--

CREATE TABLE `transaction_history`
(
  `id` int
(11) NOT NULL,
  `sender_account_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `sender_bank_code` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `receiver_account_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `receiver_bank_code` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `amount` int
(30) NOT NULL,
  `transaction_fee` int
(30) NOT NULL,
  `message` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user`
(
  `id` int
(11) NOT NULL,
  `name` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar
(225) COLLATE utf8_unicode_ci NOT NULL,
  `phone_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `birthday` date NOT NULL,
  `address` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `gender` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `role_name` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `personal_number` varchar
(30) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user`
  (`id`, `name`, `username`, `password
  `, `phone_number`, `email`, `birthday`, `address`, `gender`, `role_name`, `personal_number`, `created_at`) VALUES
(1, '', 'abc', '1234', '', '', '0000-00-00', '', '', '', '', '0000-00-00'),
(2, 'Phongle', 'phongcoi696', '$2a$10$jNxRG8DwS00/wobSwGk90u.', '232323', 'phongcoi696@gmail.com', '2015-05-23', '123 Luy ban bich phuong hoa th', 'Nam', 'admin', '123456789', '0000-00-00'),
(3, 'Phongle', 'phongcoi696', '', '232323', 'phongcoi696@gmail.com', '2015-05-23', '123 Luy ban bich phuong hoa th', 'Nam', 'admin', '123456789', '2020-06-07'),
(4, 'LeHuuNhan', 'lehuunhan1998', '$2a$10$Y9R3soviXGxuTR5HZwZYvOH', '12345679', 'lehuunhan150698@gmail.com', '1998-05-23', '123 Luy ban bich phuong hoa th', 'Nam', 'admin', '123456789', '2020-06-07'),
(5, 'Phongle', 'phongcoi696', '$2a$10$jNxRG8DwS00/wobSwGk90u.', '232323', 'phongcoi696@gmail.com', '2015-05-23', '123 Luy ban bich phuong hoa th', 'Nam', 'admin', '123456789', '2020-06-07'),
(6, '', 'lehuunhan19983', '$2a$10$u3Eel4dI52YwDEoj6X0FY.W', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(7, '', 'lehuunhan199834', '$2a$10$VRm.Pjp7yfjeuoLhJPwb7uC', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(8, '', 'lehuunhan199834', '[object Promise]', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(9, '', 'lehuunhan1994834', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(10, '', 'abcde', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(11, '', 'abcde1', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(12, '', 'abcde2', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(13, '', 'abcde2', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(14, '', 'abcde3', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(15, '', 'abcde4', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(16, '', 'abcde4', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(17, '', 'abcde4', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(18, '', 'abcde4', '', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(19, '', 'abcde5', '$2b$10$rNZLcxMvpUAhbDcJgsx4POL', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(20, '', 'abcde6', '$2b$10$3A4U4ObyVtlNoNDyyLe62uw', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(21, '', 'abcde11', '$2a$10$jKCc95/hyuQ3lAZet.FqzeL', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(22, '', 'test', '$2a$10$x./qiE4jTp41wVVrqOnz3OiojdDh2q2/iR/EXrEQnwJcgzG2Iy/Fe', '', 'phongcoi696@gmail.com', '0000-00-00', '', '', '', '', '0000-00-00'),
(23, '', 'phonglee', '$2a$10$mcX4fQl2ZFfxhUG8AnsQvuJtmSjedwGety4DjacQyt1RlQiS8zube', '', 'phongcoi696@gmail.com', '2015-05-23', '', 'Nam', 'admin', '123456789', '2020-06-13'),
(24, '', 'phongdeptraicuto', '$2a$10$0hTLYLJKg0kpm6SGibqMuObPL/fBmgjEv6LOyU1.Eps70QpBbiaY.', '', 'phongcoi696@gmail.com', '2015-05-23', '', 'Nam', 'admin', '123456789', '2020-06-13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
ADD PRIMARY KEY
(`id`);

--
-- Indexes for table `associate_bank`
--
ALTER TABLE `associate_bank`
ADD PRIMARY KEY
(`id`);

--
-- Indexes for table `receiver_list`
--
ALTER TABLE `receiver_list`
ADD PRIMARY KEY
(`id`);

--
-- Indexes for table `transaction_history`
--
ALTER TABLE `transaction_history`
ADD PRIMARY KEY
(`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
ADD PRIMARY KEY
(`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `id` int
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `associate_bank`
--
ALTER TABLE `associate_bank`
  MODIFY `id` int
(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `receiver_list`
--
ALTER TABLE `receiver_list`
  MODIFY `id` int
(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `transaction_history`
--
ALTER TABLE `transaction_history`
  MODIFY `id` int
(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int
(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
