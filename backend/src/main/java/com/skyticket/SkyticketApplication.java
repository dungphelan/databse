package com.skyticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SkyticketApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkyticketApplication.class, args);
        System.out.println("==================================================");
        System.out.println("🚀 SkyTicket Backend Server is RUNNING at port 8080");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("==================================================");
    }
}