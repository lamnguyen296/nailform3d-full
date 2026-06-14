package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.AppointmentCreationRequest;
import com.restapi.identityservice.dto.request.DirectBookingRequest;
import com.restapi.identityservice.entity.Appointment;
import com.restapi.identityservice.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private com.restapi.identityservice.repository.OfferRepository offerRepository;

    @Autowired
    private com.restapi.identityservice.repository.ServiceRequestRepository serviceRequestRepository;

    public Appointment createAppointment(AppointmentCreationRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() == null || 
            !SecurityContextHolder.getContext().getAuthentication().isAuthenticated() || 
            SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized: Invalid token or not logged in.");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Appointment appt = new Appointment();
        appt.setOfferId(request.getOfferId());
        appt.setUserId(username);
        appt.setSalonId(request.getSalonId());
        appt.setAppointmentDate(request.getAppointmentDate());
        appt.setAppointmentTime(request.getAppointmentTime());
        appt.setNotes(request.getNotes());
        appt.setLastUpdatedBy("USER");

        // Link design details, price, and location for better UI and historical records
        offerRepository.findById(request.getOfferId()).ifPresent(offer -> {
            appt.setRequestId(offer.getRequestId());
            appt.setPrice(offer.getPrice());
            serviceRequestRepository.findById(offer.getRequestId()).ifPresent(sr -> {
                appt.setThumbnailBase64(sr.getThumbnailBase64());
                appt.setLocation(sr.getLocation());
            });
        });

        return appointmentRepository.save(appt);
    }

    public List<Appointment> getAppointmentsForSalon(String salonId) {
        return appointmentRepository.findBySalonIdOrderByCreatedAtDesc(salonId);
    }

    public Appointment createDirectAppointment(DirectBookingRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() == null ||
            !SecurityContextHolder.getContext().getAuthentication().isAuthenticated() ||
            SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Please log in to book an appointment.");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Appointment appt = new Appointment();
        appt.setUserId(username);
        appt.setSalonId(request.getSalonId());
        appt.setTechnicianName(request.getTechnicianName()); // null => salon tự sắp xếp
        appt.setBookingType("DIRECT");
        appt.setAppointmentDate(request.getAppointmentDate());
        appt.setAppointmentTime(request.getAppointmentTime());
        appt.setNotes(request.getNotes());
        appt.setLocation(request.getLocation());
        appt.setPrice(request.getPrice());
        appt.setThumbnailBase64(request.getThumbnailBase64());
        appt.setDesignData(request.getDesignData());
        if (request.getDesignRequestId() != null) {
            appt.setRequestId(request.getDesignRequestId());
        }
        appt.setLastUpdatedBy("USER");
        return appointmentRepository.save(appt);
    }

    public List<Appointment> getAppointmentsForUser(String userId) {
        return appointmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Appointment updateAppointmentStatus(String appointmentId, String status) {
        System.out.println("Updating appointment " + appointmentId + " to status " + status);
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));
        appt.setStatus(status);
        if (status.equals("COMPLETED") || status.equals("CANCELLED")) {
             // Optional: record who finalized it if needed
        }
        return appointmentRepository.save(appt);
    }

    public Appointment rescheduleAppointment(String appointmentId, java.time.LocalDate newDate, String newTime, String byWhom) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setAppointmentDate(newDate);
        appt.setAppointmentTime(newTime);
        appt.setStatus("RESCHEDULED");
        appt.setLastUpdatedBy(byWhom);
        return appointmentRepository.save(appt);
    }

    public Appointment acceptReschedule(String appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("SCHEDULED");
        return appointmentRepository.save(appt);
    }
}
