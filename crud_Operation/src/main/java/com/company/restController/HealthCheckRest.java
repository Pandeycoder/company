package com.company.restController;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthCheckRest {

	@GetMapping("/")
	public ResponseEntity<Map<String, Object>> healthCheck() {

		return ResponseEntity.ok(
				Map.of("status", "success", "statusCode", HttpStatus.OK.value(), "result ", "Application is running"));

	}

}
