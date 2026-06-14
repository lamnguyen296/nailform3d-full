package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.AppointmentCreationRequest;
import com.restapi.identityservice.dto.request.DirectBookingRequest;
import com.restapi.identityservice.entity.Appointment;
import com.restapi.identityservice.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public Appointment createAppointment(@RequestBody AppointmentCreationRequest request) {
        return appointmentService.createAppointment(request);
    }

    @PostMapping("/direct")
    public Appointment createDirectBooking(@RequestBody DirectBookingRequest request) {
        return appointmentService.createDirectAppointment(request);
    }

    @GetMapping("/salon/{salonId}")
    public List<Appointment> getAppointmentsForSalon(@PathVariable String salonId) {
        return appointmentService.getAppointmentsForSalon(salonId);
    }

    @GetMapping("/user/{userId}")
    public List<Appointment> getAppointmentsForUser(@PathVariable String userId) {
        return appointmentService.getAppointmentsForUser(userId);
    }

    @PutMapping("/{appointmentId}/status")
    public Appointment updateAppointmentStatus(@PathVariable String appointmentId, @RequestParam String status) {
        return appointmentService.updateAppointmentStatus(appointmentId, status);
    }

    @PutMapping("/{appointmentId}/reschedule")
    public Appointment rescheduleAppointment(
            @PathVariable String appointmentId,
            @RequestParam String date,
            @RequestParam String time,
            @RequestParam String by) {
        return appointmentService.rescheduleAppointment(appointmentId, java.time.LocalDate.parse(date), time, by);
    }

    @PutMapping("/{appointmentId}/accept")
    public Appointment acceptReschedule(@PathVariable String appointmentId) {
        return appointmentService.acceptReschedule(appointmentId);
    }
}
