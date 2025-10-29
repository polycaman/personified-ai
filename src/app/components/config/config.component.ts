import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OllamaService } from "../../services/ollama.service";
import { OllamaConfig } from "../../models/types";

@Component({
  selector: "app-config",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.scss"],
})
export class ConfigComponent implements OnInit {
  config: OllamaConfig = {
    host: "localhost",
    port: 11434,
    model: "llama3.2",
  };
  isConnected = false;
  isTesting = false;

  constructor(private ollamaService: OllamaService) {}

  ngOnInit(): void {
    this.config = this.ollamaService.getConfig();
    this.testConnection();
  }

  async testConnection(): Promise<void> {
    this.isTesting = true;
    try {
      this.isConnected = await this.ollamaService.testConnection();
    } catch (error) {
      this.isConnected = false;
    } finally {
      this.isTesting = false;
    }
  }

  async saveConfig(): Promise<void> {
    this.ollamaService.saveConfig(this.config);
    await this.testConnection();
    alert("Configuration saved!");
  }
}
