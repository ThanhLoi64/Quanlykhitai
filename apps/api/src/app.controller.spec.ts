import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationService } from './registration/registration.service';

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [AppService, RegistrationService],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
