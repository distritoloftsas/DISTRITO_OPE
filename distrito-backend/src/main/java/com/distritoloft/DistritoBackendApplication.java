package com.distritoloft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DistritoBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DistritoBackendApplication.class, args);
	}

}
