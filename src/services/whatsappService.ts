// Utilitarios para montar mensagens e links de contato pelo WhatsApp.
import { Vehicle } from '@/types';
import { sellerService } from './sellerService';

// O endereço do "clique para conversar" do WhatsApp é sempre o mesmo — não
// é uma configuração que muda por ambiente. Antes isso dependia 100% da
// variável VITE_WHATSAPP_API_URL existir no .env usado no build; se
// faltasse (como aconteceu no build que foi pra produção, cujo .env só
// tinha as duas variáveis do Supabase), o link virava
// "undefined?phone=...", o que quebrava silenciosamente o botão
// "Negociar" e o de contato. Agora há um valor padrão para nunca faltar.
const WHATSAPP_API_URL =
  import.meta.env.VITE_WHATSAPP_API_URL || 'https://api.whatsapp.com/send';

export const whatsappService = {
  /**
   * Gerar link de WhatsApp com mensagem pré-formatada
   */
  generateLink(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    // Remover caracteres não numéricos do número
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `${WHATSAPP_API_URL}?phone=${cleanPhone}&text=${encodedMessage}`;
  },

  /**
   * Abrir WhatsApp com mensagem
   */
  openWhatsApp(phoneNumber: string, message: string): void {
    const link = this.generateLink(phoneNumber, message);
    window.open(link, '_blank');
  },

  /**
   * Mensagem de interesse em veículo
   */
  generateVehicleInterestMessage(vehicle: Vehicle, userName: string): string {
    const signature = userName ? `\n\nAtenciosamente,\n${userName}` : '';
    return `Olá! Tenho interesse neste veículo:\n\n*${vehicle.marca} ${vehicle.modelo} ${vehicle.versao}*\n\n📅 Ano: ${vehicle.ano}\n📊 KM: ${vehicle.km.toLocaleString('pt-BR')}\n\nGostaria de receber mais informações.${signature}`;
  },

  /**
   * Mensagem de contato geral
   */
  generateGeneralContactMessage(
    name: string,
    email: string,
    subject: string,
    message: string
  ): string {
    return `Novo contato do site JR Veículos:\n\n*Nome:* ${name}\n*Email:* ${email}\n*Assunto:* ${subject}\n\n*Mensagem:*\n${message}`;
  },

  /**
   * Mensagem de financiamento
   */
  generateFinancingMessage(
    dados: {
      nome: string;
      whatsapp: string;
      cpf: string;
      rg: string;
      sexo: string;
      estado_civil: string;
    },
    vehicle?: Vehicle
  ): string {
    let message =
      `Solicitação de financiamento:\n\n` +
      `*Nome:* ${dados.nome}\n` +
      `*WhatsApp:* ${dados.whatsapp}\n` +
      `*CPF:* ${dados.cpf}\n` +
      `*RG:* ${dados.rg}\n` +
      `*Sexo:* ${dados.sexo}\n` +
      `*Estado civil:* ${dados.estado_civil}`;

    if (vehicle) {
      message += `\n\n*Veículo:*\n${vehicle.marca} ${vehicle.modelo}\nAno: ${vehicle.ano}`;
    }

    return message;
  },

  /**
   * Enviar para WhatsApp principal da loja
   */
  async hasRegisteredSellers(): Promise<boolean> {
    return sellerService.hasActiveSellers();
  },

  async sendToStore(message: string): Promise<boolean> {
    const seller = await sellerService.getRandomActiveSeller();
    if (!seller) return false;
    window.location.assign(this.generateLink(seller.whatsapp, message));
    return true;
  },

  /**
   * Enviar para vendedor específico
   */
  sendToSeller(sellerNumber: string, message: string): void {
    this.openWhatsApp(sellerNumber, message);
  },
};
