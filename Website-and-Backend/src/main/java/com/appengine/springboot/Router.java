package com.appengine.springboot;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class Router {

  @RequestMapping({"/", "/home"})
  public String getHome() {
    return "index";
  }

  @RequestMapping(value = "/faq")
  public String getFAQ() {
    return "faq";
  }

  @RequestMapping(value = "/privacy")
  public String getPrivacy() {
    return "privacy";
  }

  @RequestMapping(value = "/goodbye")
  public String getGoodbye() {
    return "uninstall";
  }

  @RequestMapping(value = "/info/{company}")
  public String getInfo(@PathVariable("company") String companyName, Model model) {
    model.addAttribute(
        "companyName",
        companyName); // doesn't do anything as of right now. Leaving it in as an example for future
    // thymeleaf use
    return "info";
  }
}
