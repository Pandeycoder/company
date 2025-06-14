package com.company.restController;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.company.entity.Company;
import com.company.repo.CompanyRepo;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyRest {

    @Autowired
    private CompanyRepo companyRepository;

    
    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        Company savedCompany = companyRepository.save(company);
        return ResponseEntity.ok(savedCompany);
    }

   
    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

 
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Optional<Company> company = companyRepository.findById(id);
        return company.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE - Update existing company
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company newDetails) {
        Optional<Company> optionalCompany = companyRepository.findById(id);

        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setName(newDetails.getName());
            company.setEmail(newDetails.getEmail());
            company.setPhone(newDetails.getPhone());
            company.setAddress(newDetails.getAddress());
            return ResponseEntity.ok(companyRepository.save(company));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE - Remove company
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompany(@PathVariable Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.ok("Company deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // SEARCH - Find companies by name
    @GetMapping("/search")
    public List<Company> searchCompanies(@RequestParam String name) {
        return companyRepository.findByNameContaining(name);
    }
}
